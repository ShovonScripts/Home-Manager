import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHousehold } from '../context/HouseholdContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { formatCurrency } from '../utils/currency';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { household, members, isLoading } = useHousehold();

  const currencySymbol = household?.currency || '৳';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Welcome Banner */}
      <View style={[styles.welcomeCard, { backgroundColor: colors.primaryContainer }]}>
        <View>
          <Text style={[styles.greetingText, { color: colors.onPrimaryContainer }]}>
            Good Morning
          </Text>
          <Text style={[styles.householdName, { color: colors.onPrimaryContainer }]}>
            🏠 {household?.name || 'Home Manager'}
          </Text>
        </View>
        <View style={[styles.memberBadge, { backgroundColor: colors.surface }]}>
          <Ionicons name="people" size={16} color={colors.primary} />
          <Text style={[styles.memberCountText, { color: colors.onSurface }]}>
            {members.length} {members.length === 1 ? 'Member' : 'Members'}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
        Home Overview
      </Text>

      {/* Summary Cards Grid */}
      <View style={styles.gridContainer}>
        {/* Spending Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
            <Ionicons name="wallet" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>
            Household Spending
          </Text>
          <Text style={[styles.cardValue, { color: colors.onSurface }]}>
            {formatCurrency(0, currencySymbol)}
          </Text>
          <Text style={[styles.cardSubtext, { color: colors.outline }]}>This month</Text>
        </View>

        {/* Grocery Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.secondaryContainer }]}>
            <Ionicons name="basket" size={22} color={colors.secondary} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>Grocery</Text>
          <Text style={[styles.cardValue, { color: colors.onSurface }]}>0 items</Text>
          <Text style={[styles.cardSubtext, { color: colors.outline }]}>Pending list</Text>
        </View>

        {/* Bills Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.errorContainer }]}>
            <Ionicons name="receipt" size={22} color={colors.error} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>Bills Due</Text>
          <Text style={[styles.cardValue, { color: colors.onSurface }]}>0 due</Text>
          <Text style={[styles.cardSubtext, { color: colors.outline }]}>Next 7 days</Text>
        </View>

        {/* Tasks Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.successContainer }]}>
            <Ionicons name="checkbox" size={22} color={colors.success} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>Tasks Today</Text>
          <Text style={[styles.cardValue, { color: colors.onSurface }]}>0 today</Text>
          <Text style={[styles.cardSubtext, { color: colors.outline }]}>All caught up</Text>
        </View>
      </View>

      {/* Foundation Status Notice */}
      <View style={[styles.noticeCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        <Text style={[styles.noticeText, { color: colors.onSurfaceVariant }]}>
          Foundation architecture successfully initialized with SQLite, Expo Router, and centralized theme tokens. Ready for incremental feature development.
        </Text>
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
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  householdName: {
    fontSize: 22,
    fontWeight: '700',
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
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  card: {
    width: '48%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
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
    fontSize: 20,
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
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
