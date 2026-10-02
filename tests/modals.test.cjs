const assert = require('node:assert/strict');
const { test } = require('node:test');
const { React, TestRenderer, createUI, render, update, press, textContent } = require('./support.cjs');

const categories = [
  { id: 'cat-food', name: 'Food', icon: 'restaurant', color: '#FF7043' },
  { id: 'cat-transport', name: 'Transport', icon: 'car', color: '#AB47BC' },
];

async function enter(renderer, index, value) {
  await TestRenderer.act(async () => renderer.root.findAllByType('TextInput')[index].props.onChangeText(value));
}

function inputValues(renderer) {
  return renderer.root.findAllByType('TextInput').map((input) => input.props.value);
}

function cleanup(t, renderer) {
  t.after(async () => TestRenderer.act(async () => renderer.unmount()));
}

test('add expense keeps every draft field on category/member/theme updates and saves the selected member ID', async (t) => {
  const { load, state } = createUI();
  const { ExpenseItemModal } = load('src/components/expenses/ExpenseItemModal.tsx');
  const saved = [];
  let closes = 0;
  let props = { visible: true, expenseToEdit: null, categories, onClose: () => closes++, onSave: (...args) => saved.push(args) };
  const renderer = await render(ExpenseItemModal, props);
  cleanup(t, renderer);
  assert.deepEqual(inputValues(renderer), ['', '', '']);
  assert.match(textContent(renderer), /Paid By: Shovon/);
  await enter(renderer, 0, 'Bus tickets');
  await enter(renderer, 1, '150.75');
  await enter(renderer, 2, 'Keep this draft');
  await press(renderer, 'Transport');
  await press(renderer, 'Paid by Sarah');

  state.themeMode = 'dark';
  state.household.members = [
    { id: 'member-new', name: 'New Default', role: 'member' },
    { ...state.household.members[1], name: 'Renamed Sarah' },
    { ...state.household.members[0] },
  ];
  props = { ...props, categories: [{ id: 'cat-new', name: 'New Default', icon: 'receipt', color: '#78909C' }, ...categories.map((cat) => ({ ...cat }))] };
  await update(renderer, ExpenseItemModal, props);
  assert.deepEqual(inputValues(renderer), ['Bus tickets', '150.75', 'Keep this draft']);
  assert.match(textContent(renderer), /Paid By: Renamed Sarah/);
  await press(renderer, 'Add expense');
  assert.deepEqual(saved[0].slice(0, 4), ['cat-transport', 'Bus tickets', 150.75, 'member-2']);
  assert.equal(saved[0][5], 'Keep this draft');
  assert.equal(closes, 1);

  await update(renderer, ExpenseItemModal, { ...props, visible: false });
  await update(renderer, ExpenseItemModal, props);
  assert.deepEqual(inputValues(renderer), ['', '', '']);
  assert.match(textContent(renderer), /Paid By: New Default/);
  await enter(renderer, 0, 'Fresh expense');
  await enter(renderer, 1, '25');
  await press(renderer, 'Add expense');
  assert.deepEqual(saved[1].slice(0, 4), ['cat-new', 'Fresh expense', 25, 'member-new']);
});

test('edit expense initializes from its record, ignores same-ID object churn, and preserves legacy names unless reselected', async (t) => {
  const { load, state } = createUI();
  const { ExpenseItemModal } = load('src/components/expenses/ExpenseItemModal.tsx');
  const expense = { id: 'exp-legacy', categoryId: 'cat-food', title: 'Old expense', amount: 40, paidBy: 'Shovon', date: 777, notes: 'Old notes' };
  const saved = [];
  let props = { visible: true, expenseToEdit: expense, categories, onClose: () => {}, onSave: (...args) => saved.push(args) };
  const renderer = await render(ExpenseItemModal, props);
  cleanup(t, renderer);
  assert.deepEqual(inputValues(renderer), ['Old expense', '40', 'Old notes']);
  assert.match(textContent(renderer), /Paid By: Shovon/);
  await enter(renderer, 0, 'Edited draft');
  await enter(renderer, 1, '99');
  await enter(renderer, 2, 'New notes');
  state.themeMode = 'dark';
  state.household.members = state.household.members.map((member) => ({ ...member }));
  props = { ...props, categories: categories.map((cat) => ({ ...cat })), expenseToEdit: { ...expense, title: 'Unrelated context snapshot' } };
  await update(renderer, ExpenseItemModal, props);
  assert.deepEqual(inputValues(renderer), ['Edited draft', '99', 'New notes']);
  await press(renderer, 'Save expense');
  assert.equal(saved[0][3], 'Shovon');
  assert.equal(saved[0][4], 777);
  await press(renderer, 'Paid by Sarah');
  await press(renderer, 'Save expense');
  assert.equal(saved[1][3], 'member-2');

  props = { ...props, expenseToEdit: { ...expense, id: 'exp-other', title: 'Another record', paidBy: 'member-1' } };
  await update(renderer, ExpenseItemModal, props);
  assert.deepEqual(inputValues(renderer), ['Another record', '40', 'Old notes']);
  await update(renderer, ExpenseItemModal, { ...props, expenseToEdit: null });
  assert.deepEqual(inputValues(renderer), ['', '', '']);
});

test('new expenses never invent a payer name; unavailable members and invalid amounts cannot be saved', async (t) => {
  const { load, state } = createUI();
  state.household.members = [];
  const { ExpenseItemModal } = load('src/components/expenses/ExpenseItemModal.tsx');
  const saved = [];
  const props = { visible: true, categories, onClose: () => {}, onSave: (...args) => saved.push(args) };
  const renderer = await render(ExpenseItemModal, props);
  cleanup(t, renderer);
  await enter(renderer, 0, 'Expense');
  await enter(renderer, 1, '50');
  const saveButton = () => renderer.root.findAllByType('TouchableOpacity').find((element) => element.props.accessibilityLabel === 'Add expense');
  assert.equal(saveButton().props.disabled, true);
  await press(renderer, 'Add expense');
  assert.equal(saved.length, 0);

  state.household.members = [{ id: 'member-1', name: 'Shovon' }];
  await update(renderer, ExpenseItemModal, props);
  assert.deepEqual(inputValues(renderer), ['Expense', '50', '']);
  await press(renderer, 'Paid by Shovon');
  for (const invalidAmount of ['Infinity', '0', '-5', '20abc']) {
    await enter(renderer, 1, invalidAmount);
    assert.equal(saveButton().props.disabled, true);
    await press(renderer, 'Add expense');
  }
  assert.equal(saved.length, 0);
  await enter(renderer, 1, '20');
  await press(renderer, 'Add expense');
  assert.equal(saved[0][3], 'member-1');
});

test('grocery assignment saves member IDs, keeps legacy data until explicit selection, and supports unassigned items', async (t) => {
  const { load, state } = createUI();
  const { GroceryItemModal } = load('src/components/grocery/GroceryItemModal.tsx');
  const item = { id: 'item-legacy', name: 'Rice', quantity: '2 kg', category: 'Grains', assignedTo: 'Shovon' };
  const saved = [];
  let props = { visible: true, itemToEdit: item, onClose: () => {}, onSave: (...args) => saved.push(args) };
  const renderer = await render(GroceryItemModal, props);
  cleanup(t, renderer);
  assert.match(textContent(renderer), /Assign To: Shovon/);
  await press(renderer, 'Save grocery item');
  assert.equal(saved[0][3], 'Shovon');
  await press(renderer, 'Assign to Sarah');
  await enter(renderer, 0, 'Draft rice');
  state.themeMode = 'dark';
  state.household.members = state.household.members.map((member) => ({ ...member }));
  props = { ...props, itemToEdit: { ...item } };
  await update(renderer, GroceryItemModal, props);
  assert.deepEqual(inputValues(renderer), ['Draft rice', '2 kg']);
  await press(renderer, 'Save grocery item');
  assert.equal(saved[1][3], 'member-2');

  await update(renderer, GroceryItemModal, { ...props, visible: false, itemToEdit: null });
  await update(renderer, GroceryItemModal, { ...props, itemToEdit: null });
  assert.deepEqual(inputValues(renderer), ['', '1']);
  const unassigned = renderer.root.findAllByType('TouchableOpacity').find((element) => element.props.accessibilityLabel === 'Unassigned');
  assert.equal(unassigned.props.accessibilityState.checked, true);
  await enter(renderer, 0, 'Milk');
  await press(renderer, 'Add grocery item');
  assert.equal(saved[2][3], undefined);
});

test('the older add-grocery modal also stores the ID, not a name', async (t) => {
  const { load } = createUI();
  const { AddGroceryItemModal } = load('src/components/grocery/AddGroceryItemModal.tsx');
  const saved = [];
  const renderer = await render(AddGroceryItemModal, { visible: true, onClose: () => {}, onAdd: (...args) => saved.push(args) });
  cleanup(t, renderer);
  await enter(renderer, 0, 'Milk');
  await press(renderer, 'Assign to Shovon');
  await press(renderer, 'Add grocery item');
  assert.equal(saved[0][3], 'member-1');
});

test('expense/grocery cards resolve member IDs to current names with a raw-value fallback', async (t) => {
  const { load, state } = createUI();
  const { ExpenseItemCard } = load('src/components/expenses/ExpenseItemCard.tsx');
  const { GroceryItemCard } = load('src/components/grocery/GroceryItemCard.tsx');
  const expense = { id: 'exp-1', categoryId: 'cat-food', title: 'Food', amount: 20, currency: '৳', paidBy: 'member-1', date: 777 };
  const grocery = { id: 'item-1', name: 'Milk', quantity: '1', category: 'Dairy', assignedTo: 'member-1', isCompleted: false };
  const Cards = ({ paidBy = expense.paidBy, assignedTo = grocery.assignedTo }) => React.createElement(React.Fragment, null,
    React.createElement(ExpenseItemCard, { expense: { ...expense, paidBy }, categories, onEdit: () => {}, onDelete: () => {} }),
    React.createElement(GroceryItemCard, { item: { ...grocery, assignedTo }, onEdit: () => {}, onDelete: () => {}, onToggle: () => {} })
  );
  const renderer = await render(Cards);
  cleanup(t, renderer);
  assert.equal(textContent(renderer).match(/Shovon/g).length, 2);
  assert.ok(!textContent(renderer).includes('member-1'));
  state.household.members = [{ ...state.household.members[0], name: 'Renamed Member' }];
  await update(renderer, Cards);
  assert.equal(textContent(renderer).match(/Renamed Member/g).length, 2);
  await update(renderer, Cards, { paidBy: 'Old member name', assignedTo: 'missing-member-id' });
  assert.match(textContent(renderer), /Old member name/);
  assert.match(textContent(renderer), /missing-member-id/);
});
