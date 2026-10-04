import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Expense, ExpenseCategory } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
  expenses: Expense[];
  categories: ExpenseCategory[];
  currencySymbol: string;
}

export const ExpenseAnalyticsCard: React.FC<Props> = ({ expenses, categories, currencySymbol }) => {
  const { colors, themeMode } = useTheme();

  const glassBg = themeMode === 'dark' ? 'rgba(30, 32, 35, 0.85)' : 'rgba(255, 255, 255, 0.9)';

  if (expenses.length === 0) return null;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  if (totalSpent <= 0) return null;

  // Calculate breakdown per category
  const breakdown = categories.map((cat) => {
    const catExpenses = expenses.filter((e) => e.categoryId === cat.id);
    const catTotal = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const percentage = totalSpent > 0 ? (catTotal / totalSpent) * 100 : 0;
    return {
      ...cat,
      total: catTotal,
      percentage,
    };
  }).filter((item) => item.total > 0).sort((a, b) => b.total - a.total);

  return (
    <View style={[styles.card, { backgroundColor: glassBg, borderColor: colors.cardBorder }]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="pie-chart-outline" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.onSurface }]}>Spending Breakdown</Text>
      </View>

      {/* Multi-color progress bar */}
      <View style={styles.progressBarContainer}>
        {breakdown.map((item) => (
          <View
            key={item.id}
            style={[
              styles.progressSegment,
              {
                backgroundColor: item.color,
                width: `${Math.max(item.percentage, 3)}%`,
              },
            ]}
          />
        ))}
      </View>

      {/* Category List with Totals & Percentages */}
      <View style={styles.categoryList}>
        {breakdown.map((item) => (
          <View key={item.id} style={styles.categoryRow}>
            <View style={styles.categoryLeft}>
              <View style={[styles.bullet, { backgroundColor: item.color }]} />
              <Ionicons name={item.icon as any} size={14} color={item.color} style={{ marginRight: 6 }} />
              <Text style={[styles.categoryName, { color: colors.onSurface }]} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <View style={styles.categoryRight}>
              <Text style={[styles.categoryAmount, { color: colors.onSurface }]}>
                {formatCurrency(item.total, currencySymbol)}
              </Text>
              <Text style={[styles.categoryPercent, { color: colors.outline }]}>
                {item.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    marginBottom: Spacing.md,
    gap: 2,
  },
  progressSegment: {
    height: '100%',
  },
  categoryList: {
    gap: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.round,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryPercent: {
    fontSize: 11,
    width: 38,
    textAlign: 'right',
  },
});
