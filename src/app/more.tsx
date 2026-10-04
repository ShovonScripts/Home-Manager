import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius } from '../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../components/common/GlassCard';
import { AmbientBackground } from '../components/common/AmbientBackground';

interface MenuItem {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}



export default function MoreScreen() {
  const { colors } = useTheme();

  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Spacing.sm);
  const tabBarHeight = 52 + bottomPadding;

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
    {
      title: 'How to Use App',
      subtitle: 'Tutorials, guides & feature walkthroughs',
      icon: 'book-outline',
      route: '/help',
      color: '#26A69A',
    },
    {
      title: 'About App',
      subtitle: 'Developer credits, safety & support',
      icon: 'information-circle-outline',
      route: '/about',
      color: '#FFB74D',
    },
  ];

  return (
    <AmbientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: tabBarHeight + Spacing.lg }]}
      >
      <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
        More Features
      </Text>
      <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
        Additional household management tools
      </Text>

      <View style={styles.menuList}>
        {menuItems.map((item, index) => (
          <GlassCard
            key={index}
            style={styles.menuCardRow}
            onPress={() => router.push(item.route as any)}
            delay={index * 50}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            accessibilityHint={item.subtitle}
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
          </GlassCard>
        ))}
      </View>
    </ScrollView>
  </AmbientBackground>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
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
  menuCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
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
