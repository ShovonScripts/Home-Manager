import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHousehold } from '../context/HouseholdContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { formatCurrency } from '../utils/currency';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { colors, themeMode } = useTheme();
  const { household, members } = useHousehold();

  const currencySymbol = household?.currency || '৳';
  const glassBackground =
    themeMode === 'dark' ? 'rgba(30, 32, 35, 0.85)' : 'rgba(255, 255, 255, 0.9)';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Banner */}
      <Animated.View entering={FadeInDown.duration(400).springify()}>
        <View
          style={[
            styles.welcomeCard,
            {
              backgroundColor: colors.primaryContainer,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.welcomeTextContainer}>
            <View style={styles.greetingRow}>
              <Ionicons name="sparkles" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.greetingText, { color: colors.onPrimaryContainer }]}>
                Welcome Back
              </Text>
            </View>
            <Text style={[styles.householdName, { color: colors.onPrimaryContainer }]}>
              {household?.name || 'Home Manager'}
            </Text>
          </View>
          <AnimatedPressable
            style={[styles.memberBadge, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/family')}
          >
            <Ionicons name="people" size={16} color={colors.primary} />
            <Text style={[styles.memberCountText, { color: colors.onSurface }]}>
              {members.length} {members.length === 1 ? 'Member' : 'Members'}
            </Text>
            <Ionicons name="chevron-forward" size={12} color={colors.outline} />
          </AnimatedPressable>
        </View>
      </Animated.View>

      <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
        Household Overview
      </Text>

      {/* Summary Cards Grid */}
      <View style={styles.gridContainer}>
        {/* Spending Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(100).springify()} style={{ width: '48%' }}>
          <AnimatedPressable
            style={[
              styles.card,
              { backgroundColor: glassBackground, borderColor: colors.cardBorder },
            ]}
            onPress={() => router.push('/expenses')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="wallet" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>
              Household Spending
            </Text>
            <Text style={[styles.cardValue, { color: colors.onSurface }]}>
              {formatCurrency(0, currencySymbol)}
            </Text>
            <Text style={[styles.cardSubtext, { color: colors.outline }]}>Tap to view details</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Grocery Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(150).springify()} style={{ width: '48%' }}>
          <AnimatedPressable
            style={[
              styles.card,
              { backgroundColor: glassBackground, borderColor: colors.cardBorder },
            ]}
            onPress={() => router.push('/grocery')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.secondaryContainer }]}>
              <Ionicons name="basket" size={22} color={colors.secondary} />
            </View>
            <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>Grocery</Text>
            <Text style={[styles.cardValue, { color: colors.onSurface }]}>Manage List</Text>
            <Text style={[styles.cardSubtext, { color: colors.outline }]}>Tap to view items</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Bills Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(200).springify()} style={{ width: '48%' }}>
          <AnimatedPressable
            style={[
              styles.card,
              { backgroundColor: glassBackground, borderColor: colors.cardBorder },
            ]}
            onPress={() => router.push('/bills')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.errorContainer }]}>
              <Ionicons name="receipt" size={22} color={colors.error} />
            </View>
            <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>Bills & Payments</Text>
            <Text style={[styles.cardValue, { color: colors.onSurface }]}>Due Soon</Text>
            <Text style={[styles.cardSubtext, { color: colors.outline }]}>Tap to view bills</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Tasks Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(250).springify()} style={{ width: '48%' }}>
          <AnimatedPressable
            style={[
              styles.card,
              { backgroundColor: glassBackground, borderColor: colors.cardBorder },
            ]}
            onPress={() => router.push('/tasks')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.successContainer }]}>
              <Ionicons name="checkbox" size={22} color={colors.success} />
            </View>
            <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>Tasks Today</Text>
            <Text style={[styles.cardValue, { color: colors.onSurface }]}>Chores</Text>
            <Text style={[styles.cardSubtext, { color: colors.outline }]}>Tap to view tasks</Text>
          </AnimatedPressable>
        </Animated.View>
      </View>

      {/* Foundation Status Notice */}
      <Animated.View entering={FadeInDown.duration(400).delay(300).springify()}>
        <View
          style={[
            styles.noticeCard,
            { backgroundColor: glassBackground, borderColor: colors.cardBorder },
          ]}
        >
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
          <View style={styles.noticeTextContainer}>
            <Text style={[styles.noticeTitle, { color: colors.onSurface }]}>
              Secure Offline-First Architecture
            </Text>
            <Text style={[styles.noticeText, { color: colors.onSurfaceVariant }]}>
              Fully operational SQLite repository & domain service layers active. Smooth micro-animations enabled.
            </Text>
          </View>
        </View>
      </Animated.View>
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
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    ...Shadows.md,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  householdName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: 6,
    ...Shadows.sm,
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
    letterSpacing: 0.2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  card: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.md,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtext: {
    fontSize: 11,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
