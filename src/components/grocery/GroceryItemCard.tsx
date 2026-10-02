import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GroceryItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useHousehold } from '../../context/HouseholdContext';
import { getMemberDisplayName } from '../../utils/members';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { GROCERY_CATEGORIES } from '../../constants/groceryCategories';

interface Props {
  item: GroceryItem;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (item: GroceryItem) => void;
}

export const GroceryItemCard: React.FC<Props> = ({ item, onToggle, onDelete, onEdit }) => {
  const { colors } = useTheme();
  const { members } = useHousehold();
  const catObj = GROCERY_CATEGORIES.find((c) => c.name === item.category);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          opacity: item.isCompleted ? 0.7 : 1,
        },
      ]}
    >
      {/* Checkbox / Toggle */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        accessibilityRole="checkbox"
        accessibilityLabel={`Purchased: ${item.name}`}
        accessibilityState={{ checked: item.isCompleted }}
        hitSlop={8}
        onPress={() => onToggle(item.id, item.isCompleted)}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: item.isCompleted ? colors.primary : colors.outline,
              backgroundColor: item.isCompleted ? colors.primary : 'transparent',
            },
          ]}
        >
          {item.isCompleted && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
        </View>
      </TouchableOpacity>

      {/* Item Details (Pressable for Edit) */}
      <TouchableOpacity
        style={styles.detailsContainer}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${item.name}`}
        onPress={() => onEdit(item)}
        activeOpacity={0.7}
      >
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.itemName,
              { color: item.isCompleted ? colors.outline : colors.onSurface },
              item.isCompleted && styles.completedText,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.quantity && item.quantity !== '1' && (
            <View style={[styles.quantityBadge, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.quantityText, { color: colors.onSurfaceVariant }]}>
                {item.quantity}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          {catObj && (
            <View style={styles.categoryBadge}>
              <Ionicons name={catObj.icon as any} size={12} color={catObj.color} />
              <Text style={[styles.categoryText, { color: colors.outline }]}>{item.category}</Text>
            </View>
          )}
          {item.assignedTo && (
            <View style={styles.assigneeBadge}>
              <Ionicons name="person-outline" size={12} color={colors.primary} />
              <Text style={[styles.assigneeText, { color: colors.primary }]}>{getMemberDisplayName(item.assignedTo, members)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Delete Action */}
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)} accessibilityRole="button" accessibilityLabel={`Delete ${item.name}`} hitSlop={8}>
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
  detailsContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  quantityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
  },
  assigneeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assigneeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
