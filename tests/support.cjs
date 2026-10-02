const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const TestRenderer = require('react-test-renderer');

const ROOT = path.resolve(__dirname, '..');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Run the actual TypeScript modules with explicit native-boundary substitutes.
// Each loader has its own cache, including the database initialization promises.
function createLoader(overrides = {}) {
  const cache = new Map();
  const fileOverrides = new Map(
    Object.entries(overrides)
      .filter(([name]) => name.startsWith('src/'))
      .map(([name, value]) => [path.resolve(ROOT, name), value])
  );

  function load(relativePath) {
    let filename = path.resolve(ROOT, relativePath);
    if (!path.extname(filename)) {
      filename = ['.ts', '.tsx', '.js'].map((extension) => filename + extension)
        .find((candidate) => fs.existsSync(candidate));
    }
    if (!filename) throw new Error(`Cannot resolve ${relativePath}`);
    if (fileOverrides.has(filename)) return fileOverrides.get(filename);
    if (cache.has(filename)) return cache.get(filename).exports;

    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: filename,
    }).outputText;
    const loaded = new Module(filename, module);
    loaded.filename = filename;
    loaded.paths = Module._nodeModulePaths(path.dirname(filename));
    loaded.require = (specifier) => {
      if (Object.hasOwn(overrides, specifier)) return overrides[specifier];
      if (specifier.startsWith('.')) return load(path.resolve(path.dirname(filename), specifier));
      return require(specifier);
    };
    cache.set(filename, loaded);
    loaded._compile(compiled, filename);
    return loaded.exports;
  }
  return load;
}

function flattenStyle(style) {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flattenStyle));
  return style || {};
}

function createUI(extraOverrides = {}, { realHousehold = false } = {}) {
  const state = {
    themeMode: 'light',
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
    alerts: [],
    canGoBack: true,
    backCount: 0,
    replacements: [],
    pushes: [],
    household: {
      household: { id: 'home-1', name: 'Test Home', currency: '৳', createdAt: 1, updatedAt: 1 },
      members: [
        { id: 'member-1', householdId: 'home-1', name: 'Shovon', role: 'admin', createdAt: 1 },
        { id: 'member-2', householdId: 'home-1', name: 'Sarah', role: 'member', createdAt: 2 },
      ],
      isLoading: false,
      error: null,
      refreshHousehold: async () => {},
      addMember: async () => {},
      removeMember: async () => {},
    },
  };
  const colors = createLoader()('src/constants/colors.ts').Colors;
  const passthrough = ({ children }) => React.createElement(React.Fragment, null, children);
  const Tabs = ({ children, ...props }) => React.createElement('Tabs', props, children);
  Tabs.Screen = (props) => React.createElement('Tabs.Screen', props);
  const overrides = {
    'react-native': {
      View: 'View', Text: 'Text', TextInput: 'TextInput', TouchableOpacity: 'TouchableOpacity',
      ScrollView: 'ScrollView', FlatList: 'FlatList', Switch: 'Switch',
      KeyboardAvoidingView: 'KeyboardAvoidingView', ActivityIndicator: 'ActivityIndicator',
      Modal: ({ visible, children, ...props }) => visible ? React.createElement('Modal', props, children) : null,
      Platform: { OS: 'android' },
      StyleSheet: { create: (value) => value, flatten: flattenStyle },
      Alert: { alert: (...args) => state.alerts.push(args) },
    },
    '@expo/vector-icons': { Ionicons: 'Ionicons' },
    'expo-status-bar': { StatusBar: 'StatusBar' },
    'react-native-safe-area-context': {
      SafeAreaProvider: 'SafeAreaProvider', SafeAreaView: 'SafeAreaView',
      useSafeAreaInsets: () => state.insets,
    },
    'expo-router': {
      Tabs,
      router: {
        canGoBack: () => state.canGoBack,
        back: () => state.backCount++,
        replace: (route) => state.replacements.push(route),
        push: (route) => state.pushes.push(route),
      },
    },
    'src/context/ThemeContext.tsx': {
      ThemeProvider: passthrough,
      useTheme: () => ({ colors: colors[state.themeMode], themeMode: state.themeMode, toggleTheme: () => {} }),
    },
    'src/context/HouseholdContext.tsx': {
      HouseholdProvider: passthrough, useHousehold: () => state.household,
    },
    'src/storage/database.ts': { initializeDatabase: async () => {} },
    ...extraOverrides,
  };
  if (realHousehold) delete overrides['src/context/HouseholdContext.tsx'];
  return { load: createLoader(overrides), state, colors };
}

async function render(Component, props = {}) {
  let renderer;
  await TestRenderer.act(async () => {
    renderer = TestRenderer.create(React.createElement(Component, props));
  });
  return renderer;
}

async function update(renderer, Component, props = {}) {
  await TestRenderer.act(async () => renderer.update(React.createElement(Component, props)));
}

async function press(renderer, label) {
  const button = renderer.root.findAllByType('TouchableOpacity')
    .find((element) => element.props.accessibilityLabel === label);
  if (!button) throw new Error(`Button not found: ${label}`);
  await TestRenderer.act(async () => button.props.onPress());
}

function textContent(renderer) {
  return renderer.root.findAllByType('Text')
    .map((element) => element.children.filter((child) => typeof child === 'string').join('')).join('\n');
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

module.exports = {
  React, TestRenderer, createLoader, createUI, render, update, press,
  textContent, flattenStyle, deferred,
};
