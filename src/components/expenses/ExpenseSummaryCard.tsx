import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  totalAmount: number;
  currencySymbol: string;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onAddPress: () => void;
}

export const ExpenseSummaryCard: React.FC<Props> = ({
  totalAmount,
  currencySymbol,
  selectedMonth,
  onMonthChange,
  onAddPress,
}) => {
  const { colors } = useTheme();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
  const currentMonthKey = `${currentYear}-${currentMonthNum}`;

  const currentMonthLabel =
    selectedMonth === 'all'
      ? 'All Time'
      : new Date(selectedMonth + '-01').toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });

  return (
    <View style={[styles.card, { backgroundColor: colors.primaryContainer }]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.subtitle, { color: colors.onPrimaryContainer }]}>
            Total Expenses
          </Text>
          <Text style={[styles.amount, { color: colors.onPrimaryContainer }]}>
            {formatCurrency(totalAmount, currencySymbol)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={onAddPress}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Month Filter Selector Pills */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.pill,
            {
              backgroundColor: selectedMonth === 'all' ? colors.primary : colors.surface,
              borderColor: selectedMonth === 'all' ? colors.primary : colors.cardBorder,
            },
          ]}
          onPress={() => onMonthChange('all')}
        >
          <Text
            style={[
              styles.pillText,
              { color: selectedMonth === 'all' ? colors.onPrimary : colors.onSurface },
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.pill,
            {
              backgroundColor: selectedMonth === currentMonthKey ? colors.primary : colors.surface,
              borderColor: selectedMonth === currentMonthKey ? colors.primary : colors.cardBorder,
            },
          ]}
          onPress={() => onMonthChange(currentMonthKey)}
        >
          <Text
            style={[
              styles.pillText,
              { color: selectedMonth === currentMonthKey ? colors.onPrimary : colors.onSurface },
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
