const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  React, TestRenderer, createUI, render, update, press, textContent, flattenStyle, deferred,
} = require('./support.cjs');

const category = { id: 'cat-food', name: 'Food', icon: 'restaurant', color: '#FF7043' };
const records = {
  Grocery: { list: { id: 'list-1', householdId: 'home-1', name: 'Main', isArchived: false }, items: [{ id: 'item-1', name: 'Milk', category: 'Dairy', isCompleted: false }] },
  Expense: { expenses: [{ id: 'exp-1', title: 'Food', paidBy: 'member-1', amount: 100, categoryId: 'cat-food', date: 777 }], categories: [category] },
  Bill: [{ id: 'bill-1', title: 'Gas', amount: 100, category: 'Utilities', dueDate: 777, isPaid: false }],
};
const features = [
  { name: 'Grocery', route: 'grocery', hook: 'useGrocery', provider: 'GroceryProvider', load: 'loadItems', service: 'getActiveListAndItems', fab: 'Add grocery item' },
  { name: 'Expense', route: 'expenses', hook: 'useExpense', provider: 'ExpenseProvider', load: 'loadExpenses', service: 'loadExpensesData', fab: 'Add expense' },
  { name: 'Bill', route: 'bills', hook: 'useBill', provider: 'BillProvider', load: 'loadBills', service: 'loadBills', fab: 'Add bill' },
];

function cleanup(t, renderer) {
  t.after(async () => TestRenderer.act(async () => renderer.unmount()));
}

for (const feature of features) {
  test(`${feature.name} context clears stale errors on retry and does not reload on member/theme churn`, async (t) => {
    let requests = 0;
    let refreshes = 0;
    const pending = deferred();
    const { load, state } = createUI({
      [`src/services/${feature.name.toLowerCase()}Service.ts`]: {
        [`${feature.name}Service`]: {
          [feature.service]: async () => {
            requests++;
            if (requests === 1) throw new Error('Read failed');
            return pending.promise;
          },
        },
      },
    });
    const context = load(`src/context/${feature.name}Context.tsx`);
    let latest;
    const Probe = () => { latest = context[feature.hook](); return null; };
    const props = { children: React.createElement(Probe) };
    const renderer = await render(context[feature.provider], props);
    cleanup(t, renderer);
    assert.equal(latest.isLoading, false);
    assert.equal(latest.error, 'Read failed');
    let retry;
    TestRenderer.act(() => { retry = latest[feature.load](); });
    assert.equal(latest.isLoading, true);
    assert.equal(latest.error, null);
    await TestRenderer.act(async () => { pending.resolve(records[feature.name]); await retry; });
    assert.equal(latest.isLoading, false);
    assert.equal(latest.error, null);
    assert.equal(requests, 2);

    state.themeMode = 'dark';
    state.household.household = { ...state.household.household, name: 'Renamed home' };
    state.household.members = state.household.members.map((member) => ({ ...member }));
    await update(renderer, context[feature.provider], props);
    assert.equal(requests, 2);

    state.household.error = 'Household read failed';
    state.household.refreshHousehold = async () => { refreshes++; state.household.error = null; };
    await update(renderer, context[feature.provider], props);
    assert.equal(latest.error, 'Household read failed');
    assert.equal(latest.isLoading, false);
    await TestRenderer.act(async () => { await latest[feature.load](); });
    assert.equal(refreshes, 1);
    assert.equal(latest.error, null);
    assert.equal(requests, 3);
  });

  test(`${feature.name} context surfaces a missing/failed household instead of an endless spinner, and retries it`, async (t) => {
    let requests = 0;
    let refreshes = 0;
    const { load, state } = createUI({
      [`src/services/${feature.name.toLowerCase()}Service.ts`]: {
        [`${feature.name}Service`]: { [feature.service]: async () => { requests++; return records[feature.name]; } },
      },
    });
    const originalHousehold = state.household.household;
    state.household.household = null;
    state.household.isLoading = true;
    const context = load(`src/context/${feature.name}Context.tsx`);
    let latest;
    const Probe = () => { latest = context[feature.hook](); return null; };
    const props = { children: React.createElement(Probe) };
    const renderer = await render(context[feature.provider], props);
    cleanup(t, renderer);
    assert.equal(requests, 0);
    assert.equal(latest.isLoading, true);
    state.household.isLoading = false;
    state.household.error = 'Household unavailable';
    await update(renderer, context[feature.provider], props);
    assert.equal(latest.isLoading, false);
    assert.equal(latest.error, 'Household unavailable');
    state.household.refreshHousehold = async () => {
      refreshes++;
      state.household.household = originalHousehold;
      state.household.error = null;
    };
    await update(renderer, context[feature.provider], props);
    await TestRenderer.act(async () => {
      await latest[feature.load]();
      renderer.update(React.createElement(context[feature.provider], props));
    });
    assert.equal(refreshes, 1);
    assert.equal(requests, 1);
    assert.equal(latest.error, null);
    assert.equal(latest.isLoading, false);
  });
}

test('expense search still finds expenses by member name after ID storage, including legacy strings', async (t) => {
  const data = {
    expenses: [
      { ...records.Expense.expenses[0], id: 'id-based', paidBy: 'member-1' },
      { ...records.Expense.expenses[0], id: 'legacy', paidBy: 'Old Name' },
    ], categories: [category],
  };
  const { load } = createUI({ 'src/services/expenseService.ts': { ExpenseService: { loadExpensesData: async () => data } } });
  const { ExpenseProvider, useExpense } = load('src/context/ExpenseContext.tsx');
  let latest;
  const Probe = () => { latest = useExpense(); return null; };
  const renderer = await render(ExpenseProvider, { children: React.createElement(Probe) });
  cleanup(t, renderer);
  TestRenderer.act(() => latest.setSearchQuery('shovon'));
  assert.deepEqual(latest.filteredExpenses.map((expense) => expense.id), ['id-based']);
  TestRenderer.act(() => latest.setSearchQuery('old name'));
  assert.deepEqual(latest.filteredExpenses.map((expense) => expense.id), ['legacy']);
});

test('household loading retries are real and a failed member write rejects instead of reporting success', async (t) => {
  let reads = 0;
  const household = { id: 'home-1', name: 'Home', currency: '৳', createdAt: 1, updatedAt: 1 };
  const { load } = createUI({
    'src/services/householdService.ts': {
      HouseholdService: {
        loadHouseholdData: async () => {
          reads++;
          if (reads === 1) throw new Error('Household load failed');
          return { household, members: [] };
        },
        addNewMember: async () => { throw new Error('Member write failed'); },
      },
    },
  }, { realHousehold: true });
  const { HouseholdProvider, useHousehold } = load('src/context/HouseholdContext.tsx');
  let latest;
  const Probe = () => { latest = useHousehold(); return null; };
  const renderer = await render(HouseholdProvider, { children: React.createElement(Probe) });
  cleanup(t, renderer);
  assert.equal(latest.isLoading, false);
  assert.equal(latest.error, 'Household load failed');
  await TestRenderer.act(async () => latest.refreshHousehold());
  assert.equal(latest.error, null);
  assert.equal(latest.household.id, 'home-1');
  await TestRenderer.act(async () => assert.rejects(latest.addMember('New Member'), /Member write failed/));
  assert.equal(latest.error, 'Member write failed');
  assert.equal(latest.members.length, 0);
});

test('a successful query with no household is an actionable error, not a silent empty success', async (t) => {
  const { load } = createUI({
    'src/services/householdService.ts': { HouseholdService: { loadHouseholdData: async () => ({ household: null, members: [] }) } },
  }, { realHousehold: true });
  const { HouseholdProvider, useHousehold } = load('src/context/HouseholdContext.tsx');
  let latest;
  const Probe = () => { latest = useHousehold(); return null; };
  const renderer = await render(HouseholdProvider, { children: React.createElement(Probe) });
  cleanup(t, renderer);
  assert.equal(latest.isLoading, false);
  assert.match(latest.error, /No household data/);
});

function screenState(feature) {
  const noOp = () => {};
  return {
    isLoading: true, error: null,
    items: [], filteredItems: [], filter: 'all', selectedCategory: null, searchQuery: '',
    categories: [category], filteredExpenses: [], selectedMonth: 'all', totalAmount: 0,
    filteredBills: [], selectedStatus: 'all', totalOutstanding: 0, totalPaid: 0, totalOverdue: 0,
    setSearchQuery: noOp, setCategory: noOp, setFilter: noOp, setMonthFilter: noOp,
    setSelectedCategory: noOp, setSelectedStatus: noOp,
    addItem: noOp, updateItem: noOp, deleteItem: noOp, toggleItem: noOp, clearCompleted: noOp,
    addExpense: noOp, updateExpense: noOp, deleteExpense: noOp,
    addBill: noOp, updateBill: noOp, deleteBill: noOp, togglePaid: noOp,
    [feature.load]: async () => {},
  };
}

for (const feature of features) {
  test(`${feature.name} screen renders loading/error/retry and keeps an open modal draft across those states`, async (t) => {
    let retries = 0;
    const data = screenState(feature);
    data[feature.load] = async () => { retries++; };
    const { load, state, colors } = createUI({
      [`src/context/${feature.name}Context.tsx`]: {
        [feature.hook]: () => data,
        [feature.provider]: ({ children }) => React.createElement(React.Fragment, null, children),
      },
    });
    const Screen = load(`src/app/${feature.route}.tsx`).default;
    const renderer = await render(Screen);
    cleanup(t, renderer);
    assert.equal(renderer.root.findAllByType('ActivityIndicator').length, 1);
    assert.match(textContent(renderer), /Loading\.\.\./);
    data.isLoading = false;
    data.error = 'Database query failed';
    await update(renderer, Screen);
    assert.match(textContent(renderer), /Database query failed/);
    await press(renderer, 'Retry loading data');
    assert.equal(retries, 1);
    data.error = null;
    await update(renderer, Screen);
    await press(renderer, feature.fab);
    const modalInputs = () => renderer.root.findByType('Modal').findAllByType('TextInput');
    await TestRenderer.act(async () => modalInputs()[0].props.onChangeText('Keep my draft'));
    state.themeMode = 'dark';
    state.household.members = state.household.members.map((member) => ({ ...member }));
    data.isLoading = true;
    await update(renderer, Screen);
    assert.equal(modalInputs()[0].props.value, 'Keep my draft');
    assert.equal(renderer.root.findAllByType('ActivityIndicator').length, 1);
    data.isLoading = false;
    data.error = 'Another read failed';
    await update(renderer, Screen);
    assert.equal(modalInputs()[0].props.value, 'Keep my draft');
    data.error = null;
    await update(renderer, Screen);
    const fab = renderer.root.findAllByType('TouchableOpacity').find((element) => element.props.accessibilityLabel === feature.fab);
    assert.equal(fab.props.accessibilityRole, 'button');
    assert.equal(fab.findByType('Ionicons').props.color, colors.dark.onPrimary);
  });
}

for (const route of ['family', 'index', 'settings', 'finance']) {
  test(`${route} screen shows actionable household loading/error states`, async (t) => {
    let retries = 0;
    const { load, state } = createUI();
    state.household.isLoading = true;
    state.household.refreshHousehold = async () => { retries++; };
    const Screen = load(`src/app/${route}.tsx`).default;
    const renderer = await render(Screen);
    cleanup(t, renderer);
    assert.equal(renderer.root.findAllByType('ActivityIndicator').length, 1);
    state.household.isLoading = false;
    state.household.error = 'Household unavailable';
    await update(renderer, Screen);
    assert.match(textContent(renderer), /Household unavailable/);
    await press(renderer, 'Retry loading data');
    assert.equal(retries, 1);
    state.household.error = null;
    await update(renderer, Screen);
    assert.equal(renderer.root.findAllByType('ActivityIndicator').length, 0);
    if (route === 'index') assert.ok(!textContent(renderer).includes('Foundation architecture'));
  });
}

test('family member form keeps the entered name and never shows a success alert after a failed write', async (t) => {
  const { load, state } = createUI();
  state.household.addMember = async () => { state.household.error = 'Write failed'; throw new Error('Write failed'); };
  const Family = load('src/app/family.tsx').default;
  const renderer = await render(Family);
  cleanup(t, renderer);
  await TestRenderer.act(async () => renderer.root.findByType('TextInput').props.onChangeText('Keep this name'));
  await press(renderer, 'Add family member');
  assert.equal(state.alerts.length, 0);
  state.household.error = null;
  await update(renderer, Family);
  assert.equal(renderer.root.findByType('TextInput').props.value, 'Keep this name');
});

test('startup gate blocks feature mounting, surfaces initialization errors, and retries without a theme-triggered restart', async (t) => {
  const first = deferred();
  const second = deferred();
  let attempts = 0;
  let featureMounts = 0;
  const { load, state } = createUI({
    'src/storage/database.ts': { initializeDatabase: () => (++attempts === 1 ? first.promise : second.promise) },
  });
  const { DatabaseGate } = load('src/components/common/DatabaseGate.tsx');
  const Feature = () => { featureMounts++; return React.createElement('Text', null, 'Feature ready'); };
  const props = { children: React.createElement(Feature) };
  const renderer = await render(DatabaseGate, props);
  cleanup(t, renderer);
  assert.equal(featureMounts, 0);
  assert.equal(attempts, 1);
  state.themeMode = 'dark';
  await update(renderer, DatabaseGate, props);
  assert.equal(attempts, 1);
  await TestRenderer.act(async () => first.reject(new Error('SQLite could not open')));
  assert.equal(featureMounts, 0);
  assert.match(textContent(renderer), /SQLite could not open/);
  await press(renderer, 'Retry loading data');
  assert.equal(attempts, 2);
  assert.equal(featureMounts, 0);
  assert.equal(renderer.root.findAllByType('ActivityIndicator').length, 1);
  await TestRenderer.act(async () => second.resolve());
  assert.equal(featureMounts, 1);
  assert.match(textContent(renderer), /Feature ready/);
});

test('Bills and Expenses share one native header/back affordance; five visible tabs retain safe-area sizing', async (t) => {
  const { load, state, colors } = createUI();
  const RootLayout = load('src/app/_layout.tsx').default;
  const renderer = await render(RootLayout);
  cleanup(t, renderer);
  const tabs = () => renderer.root.findByType('Tabs');
  const screens = renderer.root.findAllByType('Tabs.Screen');
  assert.deepEqual(screens.filter((screen) => screen.props.options.href !== null).map((screen) => screen.props.name), ['index', 'tasks', 'grocery', 'finance', 'more']);
  assert.equal(tabs().props.backBehavior, 'history');
  for (const name of ['bills', 'expenses']) {
    const options = screens.find((screen) => screen.props.name === name).props.options;
    assert.equal(options.href, null);
    assert.equal(options.headerShown, true);
    assert.equal(typeof options.headerLeft, 'function');
  }
  for (const inset of [0, 34, 24, 48]) {
    state.insets.bottom = inset;
    await update(renderer, RootLayout);
    const style = tabs().props.screenOptions.tabBarStyle;
    assert.equal(style.paddingBottom, Math.max(8, inset));
    assert.equal(style.height - style.paddingBottom, 52);
    if (inset === 0) assert.equal(style.height, 60);
  }
  state.themeMode = 'dark';
  await update(renderer, RootLayout);
  assert.equal(tabs().props.screenOptions.headerTintColor, colors.dark.onSurface);
  assert.equal(tabs().props.screenOptions.tabBarStyle.borderTopColor, colors.dark.cardBorder);

  const { BackButton } = load('src/components/common/BackButton.tsx');
  const back = await render(BackButton);
  cleanup(t, back);
  await press(back, 'Go back');
  assert.equal(state.backCount, 1);
  state.canGoBack = false;
  await press(back, 'Go back');
  assert.deepEqual(state.replacements, ['/finance']);
});

test('important controls expose roles, names, checked state, hit targets, and themed foregrounds', async (t) => {
  const { load, state, colors } = createUI();
  const { BillItemCard } = load('src/components/bills/BillItemCard.tsx');
  const { GroceryItemCard } = load('src/components/grocery/GroceryItemCard.tsx');
  const { BillSummaryCard } = load('src/components/bills/BillSummaryCard.tsx');
  let toggles = 0;
  const bill = { id: 'bill-1', title: 'Gas', amount: 100, currency: '৳', category: 'Utilities', dueDate: 777, isPaid: true };
  const grocery = { id: 'item-1', name: 'Milk', quantity: '1', category: 'Dairy', isCompleted: true };
  const Controls = () => React.createElement(React.Fragment, null,
    React.createElement(BillItemCard, { bill, onTogglePaid: () => toggles++, onEdit: () => {}, onDelete: () => {} }),
    React.createElement(GroceryItemCard, { item: grocery, onToggle: () => {}, onEdit: () => {}, onDelete: () => {} }),
    React.createElement(BillSummaryCard, { totalOutstanding: 0, totalPaid: 100, totalOverdue: 0, currencySymbol: '৳', onAddPress: () => {} })
  );
  const renderer = await render(Controls);
  cleanup(t, renderer);
  for (const theme of ['light', 'dark']) {
    state.themeMode = theme;
    await update(renderer, Controls);
    const checkbox = renderer.root.findAllByType('TouchableOpacity').find((element) => element.props.accessibilityLabel === 'Paid: Gas');
    assert.equal(checkbox.props.accessibilityRole, 'checkbox');
    assert.equal(checkbox.props.accessibilityState.checked, true);
    assert.ok(checkbox.props.hitSlop >= 8);
    assert.equal(checkbox.findByType('Ionicons').props.color, colors[theme].onPrimary);
    for (const label of ['Delete bill: Gas', 'Delete Milk']) {
      const button = renderer.root.findAllByType('TouchableOpacity').find((element) => element.props.accessibilityLabel === label);
      assert.equal(button.props.accessibilityRole, 'button');
      assert.ok(button.props.hitSlop);
    }
    for (const title of ['Gas', 'Milk']) {
      const text = renderer.root.findAllByType('Text').find((element) => element.children.includes(title));
      assert.equal(flattenStyle(text.props.style).color, colors[theme].outline);
    }
    const statsRow = renderer.root.findAllByType('View').find((element) => flattenStyle(element.props.style).borderTopWidth === 1);
    assert.equal(flattenStyle(statsRow.props.style).borderTopColor, colors[theme].cardBorder);
  }
  await press(renderer, 'Paid: Gas');
  assert.equal(toggles, 1);
  bill.isPaid = false;
  await update(renderer, Controls);
  const checkbox = renderer.root.findAllByType('TouchableOpacity').find((element) => element.props.accessibilityLabel === 'Paid: Gas');
  assert.equal(checkbox.props.accessibilityState.checked, false);
});

test('settings switch and existing navigation/menu rows have accessible labels and roles', async (t) => {
  const { load, state } = createUI();
  const Settings = load('src/app/settings.tsx').default;
  const settings = await render(Settings);
  cleanup(t, settings);
  const toggle = () => settings.root.findByType('Switch');
  assert.equal(toggle().props.accessibilityRole, 'switch');
  assert.equal(toggle().props.accessibilityLabel, 'Dark mode');
  assert.equal(toggle().props.accessibilityState.checked, false);
  state.themeMode = 'dark';
  await update(settings, Settings);
  assert.equal(toggle().props.accessibilityState.checked, true);
  for (const route of ['finance', 'more']) {
    const Screen = load(`src/app/${route}.tsx`).default;
    const renderer = await render(Screen);
    cleanup(t, renderer);
    const buttons = renderer.root.findAllByType('TouchableOpacity');
    assert.ok(buttons.length >= 3);
    assert.ok(buttons.every((button) => button.props.accessibilityRole === 'button' && button.props.accessibilityLabel));
  }
});

for (const feature of features) {
  test(`${feature.name} retry recovers through the real household provider and loads feature data once`, async (t) => {
    let reads = 0;
    let featureReads = 0;
    const household = { id: 'home-1', name: 'Home', currency: '৳', createdAt: 1, updatedAt: 1 };
    const { load } = createUI({
      'src/services/householdService.ts': {
        HouseholdService: {
          loadHouseholdData: async () => {
            reads++;
            if (reads === 1) throw new Error('Household unavailable');
            return { household, members: [] };
          },
        },
      },
      [`src/services/${feature.name.toLowerCase()}Service.ts`]: {
        [`${feature.name}Service`]: {
          [feature.service]: async () => { featureReads++; return records[feature.name]; },
        },
      },
    }, { realHousehold: true });
    const { HouseholdProvider } = load('src/context/HouseholdContext.tsx');
    const context = load(`src/context/${feature.name}Context.tsx`);
    let latest;
    const Probe = () => { latest = context[feature.hook](); return null; };
    const Providers = () => React.createElement(HouseholdProvider, null,
      React.createElement(context[feature.provider], null, React.createElement(Probe))
    );
    const renderer = await render(Providers);
    cleanup(t, renderer);
    assert.equal(latest.error, 'Household unavailable');
    assert.equal(latest.isLoading, false);
    assert.equal(featureReads, 0);
    await TestRenderer.act(async () => latest[feature.load]());
    assert.equal(reads, 2);
    assert.equal(featureReads, 1);
    assert.equal(latest.error, null);
    assert.equal(latest.isLoading, false);
  });
}
