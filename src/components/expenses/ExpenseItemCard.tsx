import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Expense, ExpenseCategory } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { getMemberDisplayName } from '../../utils/members';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
  expense: Expense;
  categories: ExpenseCategory[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseItemCard: React.FC<Props> = ({ expense, categories, onEdit, onDelete }) => {
  const { colors } = useTheme();
  const members = useHouseholdStore(state => state.members);
  const category = categories.find((c) => c.id === expense.categoryId);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Main card content is touchable for editing */}
      <TouchableOpacity
        style={styles.cardContent}
        accessibilityRole="button"
        accessibilityLabel={`Edit expense: ${expense.title}`}
        onPress={() => onEdit(expense)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: category ? category.color + '20' : colors.primaryContainer },
          ]}
        >
          <Ionicons
            name={(category?.icon || 'receipt-outline') as any}
            size={20}
            color={category?.color || colors.primary}
          />
        </View>

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
              {expense.title}
            </Text>
            <Text style={[styles.amount, { color: colors.onSurface }]}>
              {formatCurrency(expense.amount, expense.currency || '৳')}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.categoryName, { color: colors.outline }]}>
              {category?.name || 'General'}
            </Text>
            <Text style={[styles.bullet, { color: colors.outline }]}>•</Text>
            <Text style={[styles.date, { color: colors.outline }]}>{formatDate(expense.date)}</Text>
            {expense.paidBy && (
              <>
                <Text style={[styles.bullet, { color: colors.outline }]}>•</Text>
                <Text style={[styles.paidBy, { color: colors.primary }]}>{getMemberDisplayName(expense.paidBy, members)}</Text>
              </>
            )}
          </View>

          {expense.notes && (
            <Text style={[styles.notes, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {expense.notes}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Delete button is a separate sibling touchable, avoiding nested touchables */}
      <TouchableOpacity
        style={styles.deleteButton}
        accessibilityRole="button"
        accessibilityLabel={`Delete expense: ${expense.title}`}
        onPress={() => onDelete(expense.id)}
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
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
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
  date: {
    fontSize: 12,
  },
  paidBy: {
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
