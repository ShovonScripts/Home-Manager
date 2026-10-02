import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  totalOutstanding: number;
  totalPaid: number;
  totalOverdue: number;
  currencySymbol: string;
  onAddPress: () => void;
}

export const BillSummaryCard: React.FC<Props> = ({
  totalOutstanding,
  totalPaid,
  totalOverdue,
  currencySymbol,
  onAddPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.primaryContainer }]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.subtitle, { color: colors.onPrimaryContainer }]}>
            Total Outstanding Bills
          </Text>
          <Text style={[styles.amount, { color: colors.onPrimaryContainer }]}>
            {formatCurrency(totalOutstanding, currencySymbol)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={onAddPress}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Bill</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.onPrimaryContainer }]}>Paid</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {formatCurrency(totalPaid, currencySymbol)}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.onPrimaryContainer }]}>Overdue</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {formatCurrency(totalOverdue, currencySymbol)}
          </Text>
        </View>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 24,
  },
});
