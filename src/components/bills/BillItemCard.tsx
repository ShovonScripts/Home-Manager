import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Bill } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (id: string, isPaid: boolean) => void;
}

export const BillItemCard: React.FC<Props> = ({ bill, onEdit, onDelete, onTogglePaid }) => {
  const { colors } = useTheme();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTime = todayStart.getTime();

  const isOverdue = !bill.isPaid && bill.dueDate < todayTime;
  const isDueToday = !bill.isPaid && bill.dueDate >= todayTime && bill.dueDate < todayTime + 86400000;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Checkbox / Paid Toggle */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        accessibilityRole="checkbox"
        accessibilityLabel={`Paid: ${bill.title}`}
        accessibilityState={{ checked: bill.isPaid }}
        hitSlop={8}
        onPress={() => onTogglePaid(bill.id, bill.isPaid)}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: bill.isPaid ? colors.success : colors.outline,
              backgroundColor: bill.isPaid ? colors.success : 'transparent',
            },
          ]}
        >
          {bill.isPaid && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
        </View>
      </TouchableOpacity>

      {/* Main card content is touchable for editing */}
      <TouchableOpacity
        style={styles.cardContent}
        accessibilityRole="button"
        accessibilityLabel={`Edit bill: ${bill.title}`}
        onPress={() => onEdit(bill)}
        activeOpacity={0.7}
      >
        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: bill.isPaid ? colors.outline : colors.onSurface },
                bill.isPaid && styles.paidText,
              ]}
              numberOfLines={1}
            >
              {bill.title}
            </Text>
            <Text style={[styles.amount, { color: colors.onSurface }]}>
              {formatCurrency(bill.amount, bill.currency || '৳')}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.categoryName, { color: colors.outline }]}>{bill.category}</Text>
            <Text style={[styles.bullet, { color: colors.outline }]}>•</Text>
            <Text
              style={[
                styles.dueDate,
                { color: isOverdue ? colors.error : isDueToday ? colors.warning : colors.outline },
              ]}
            >
              {isOverdue ? 'Overdue: ' : isDueToday ? 'Due Today: ' : 'Due: '}
              {formatDate(bill.dueDate)}
            </Text>
          </View>

          {bill.notes && (
            <Text style={[styles.notes, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {bill.notes}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Delete button as a sibling touchable */}
      <TouchableOpacity
        style={styles.deleteButton}
        accessibilityRole="button"
        accessibilityLabel={`Delete bill: ${bill.title}`}
        onPress={() => onDelete(bill.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  checkboxContainer: {
    paddingRight: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  paidText: {
    textDecorationLine: 'line-through',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 12,
  },
  bullet: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  notes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
});
