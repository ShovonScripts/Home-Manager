import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatabaseGate } from '../components/common/DatabaseGate';
import { BackButton } from '../components/common/BackButton';
import { Spacing } from '../constants/theme';
import { useHouseholdStore } from '../store/useHouseholdStore';
import { useTaskStore } from '../store/useTaskStore';
import { useBillStore } from '../store/useBillStore';
import { NotificationService } from '../services/notificationService';
import * as Haptics from 'expo-haptics';

function RootLayoutNav() {
  const { colors, themeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Spacing.sm);

  const loadHousehold = useHouseholdStore(state => state.loadHousehold);
  const tasks = useTaskStore(state => state.tasks);
  const bills = useBillStore(state => state.bills);

  const pendingTasksCount = tasks.filter(t => !t.isCompleted).length;
  const unpaidBillsCount = bills.filter(b => !b.isPaid).length;

  React.useEffect(() => {
    loadHousehold();
    // Ask for push notification permissions on boot
    NotificationService.registerForPushNotificationsAsync();
  }, [loadHousehold]);

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Tabs
        backBehavior="history"
        screenListeners={{
          tabPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        }}
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
          },
          headerTintColor: colors.onSurface,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.cardBorder,
            // Keep the original 52-point content area above the device safe inset.
            height: 52 + bottomPadding,
            paddingBottom: bottomPadding,
            paddingTop: 6,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        {/* 1. Home Tab */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarAccessibilityLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        {/* 2. Tasks Tab */}
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarAccessibilityLabel: 'Tasks',
            tabBarBadge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="checkbox-outline" size={size} color={color} />
            ),
          }}
        />

        {/* 3. Grocery Tab */}
        <Tabs.Screen
          name="grocery"
          options={{
            title: 'Grocery',
            tabBarAccessibilityLabel: 'Grocery',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="basket-outline" size={size} color={color} />
            ),
          }}
        />

        {/* 4. Finance Tab */}
        <Tabs.Screen
          name="finance"
          options={{
            title: 'Finance',
            tabBarAccessibilityLabel: 'Finance',
            tabBarBadge: unpaidBillsCount > 0 ? unpaidBillsCount : undefined,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet-outline" size={size} color={color} />
            ),
          }}
        />

        {/* 5. More Tab */}
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            tabBarAccessibilityLabel: 'More',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Sub-routes hidden from bottom tab bar */}
        <Tabs.Screen name="bills" options={{ href: null, title: 'Bills & Payments', headerShown: true, headerLeft: () => <BackButton /> }} />
        <Tabs.Screen name="expenses" options={{ href: null, title: 'Household Expenses', headerShown: true, headerLeft: () => <BackButton /> }} />
        <Tabs.Screen name="calendar" options={{ href: null, title: 'Calendar & Dates', headerShown: true, headerLeft: () => <BackButton /> }} />
        <Tabs.Screen name="reminders" options={{ href: null, title: 'Reminders & Medicine', headerShown: true, headerLeft: () => <BackButton /> }} />
        <Tabs.Screen name="notes" options={{ href: null, title: 'Shared Notes', headerShown: true, headerLeft: () => <BackButton /> }} />
        <Tabs.Screen name="family" options={{ href: null, title: 'Family Members', headerShown: true, headerLeft: () => <BackButton /> }} />
        <Tabs.Screen name="settings" options={{ href: null, title: 'Settings', headerShown: true, headerLeft: () => <BackButton /> }} />
        <Tabs.Screen name="help" options={{ href: null, title: 'How to Use App', headerShown: true, headerLeft: () => <BackButton /> }} />
        <Tabs.Screen name="about" options={{ href: null, title: 'About App', headerShown: true, headerLeft: () => <BackButton /> }} />
      </Tabs>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DatabaseGate>
          <RootLayoutNav />
        </DatabaseGate>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
