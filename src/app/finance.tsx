import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHousehold } from '../context/HouseholdContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { formatCurrency } from '../utils/currency';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function FinanceScreen() {
  const { colors } = useTheme();
  const { household } = useHousehold();
  const currencySymbol = household?.currency || '৳';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Finance Header Card */}
      <View style={[styles.headerCard, { backgroundColor: colors.primaryContainer }]}>
        <View>
          <Text style={[styles.headerSubtitle, { color: colors.onPrimaryContainer }]}>
            Total Household Finance
          </Text>
          <Text style={[styles.headerTitle, { color: colors.onPrimaryContainer }]}>
            {formatCurrency(0, currencySymbol)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/expenses')}
        >
          <Ionicons name="wallet" size={18} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>View Expenses</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
        Financial Modules
      </Text>

      {/* Navigation Card to Expenses */}
      <TouchableOpacity
        style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={() => router.push('/expenses')}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="wallet-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.navTextContainer}>
          <Text style={[styles.navTitle, { color: colors.onSurface }]}>Household Expenses</Text>
          <Text style={[styles.navSubtitle, { color: colors.onSurfaceVariant }]}>
            Track spending, categories, and monthly totals
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.outline} />
      </TouchableOpacity>

      {/* Navigation Card to Bills */}
      <TouchableOpacity
        style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={() => router.push('/bills')}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.errorContainer }]}>
          <Ionicons name="receipt-outline" size={24} color={colors.error} />
        </View>
        <View style={styles.navTextContainer}>
          <Text style={[styles.navTitle, { color: colors.onSurface }]}>Bills & Payments</Text>
          <Text style={[styles.navSubtitle, { color: colors.onSurfaceVariant }]}>
            Track utility bills, rent, and recurring payments
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.outline} />
      </TouchableOpacity>
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
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  navSubtitle: {
    fontSize: 12,
  },
});
