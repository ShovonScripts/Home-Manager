import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { HouseholdProvider } from '../context/HouseholdContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutNav() {
  const { colors, themeMode } = useTheme();

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.onSurface,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.cardBorder,
            height: 60,
            paddingBottom: 8,
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
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Sub-routes hidden from bottom tab bar */}
        <Tabs.Screen name="bills" options={{ href: null, title: 'Bills & Payments' }} />
        <Tabs.Screen name="expenses" options={{ href: null, title: 'Household Expenses' }} />
        <Tabs.Screen name="calendar" options={{ href: null, title: 'Calendar & Dates' }} />
        <Tabs.Screen name="reminders" options={{ href: null, title: 'Reminders & Medicine' }} />
        <Tabs.Screen name="notes" options={{ href: null, title: 'Shared Notes' }} />
        <Tabs.Screen name="family" options={{ href: null, title: 'Family Members' }} />
        <Tabs.Screen name="settings" options={{ href: null, title: 'Settings' }} />
      </Tabs>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HouseholdProvider>
          <RootLayoutNav />
        </HouseholdProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
