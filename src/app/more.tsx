import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface MenuItem {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/bills' | '/calendar' | '/reminders' | '/notes' | '/family' | '/settings';
  color: string;
}

export default function MoreScreen() {
  const { colors } = useTheme();

  const menuItems: MenuItem[] = [
    {
      title: 'Bills & Payments',
      subtitle: 'Utility bills, rent & recurring payments',
      icon: 'receipt-outline',
      route: '/bills',
      color: '#42A5F5',
    },
    {
      title: 'Calendar & Important Dates',
      subtitle: 'Birthdays, anniversaries & household events',
      icon: 'calendar-outline',
      route: '/calendar',
      color: '#AB47BC',
    },
    {
      title: 'Reminders & Medicine',
      subtitle: 'Medication alerts & family notifications',
      icon: 'notifications-outline',
      route: '/reminders',
      color: '#FF7043',
    },
    {
      title: 'Shared Notes',
      subtitle: 'Family noticeboard & shared lists',
      icon: 'document-text-outline',
      route: '/notes',
      color: '#26A69A',
    },
    {
      title: 'Family Members',
      subtitle: 'Manage household members & roles',
      icon: 'people-outline',
      route: '/family',
      color: '#66BB6A',
    },
    {
      title: 'Settings',
      subtitle: 'Theme, currency & application preferences',
      icon: 'settings-outline',
      route: '/settings',
      color: '#78909C',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
        More Features
      </Text>
      <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
        Additional household management tools
      </Text>

      <View style={styles.menuList}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => router.push(item.route)}
          >
            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.menuTitle, { color: colors.onSurface }]}>{item.title}</Text>
              <Text style={[styles.menuSubtitle, { color: colors.onSurfaceVariant }]}>
                {item.subtitle}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.outline} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.xl,
  },
  menuList: {
    gap: Spacing.md,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
  },
});
