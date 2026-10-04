import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert } from 'react-native';
import { GroceryItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { getMemberDisplayName } from '../../utils/members';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { GROCERY_CATEGORIES } from '../../constants/groceryCategories';

interface Props {
  item: GroceryItem;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (item: GroceryItem) => void;
}

export const GroceryItemCard: React.FC<Props> = ({ item, onToggle, onDelete, onEdit }) => {
  const { colors } = useTheme();
  const members = useHouseholdStore(state => state.members);
  const catObj = GROCERY_CATEGORIES.find((c) => c.name === item.category);

  const assignedMember = item.assignedTo ? members.find(m => m.id === item.assignedTo || m.name === item.assignedTo) : undefined;
  const hasWhatsapp = Boolean(assignedMember?.whatsapp);

  const handleNotify = () => {
    if (!assignedMember?.whatsapp) return;
    const phone = assignedMember.whatsapp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${assignedMember.name}! Just a quick reminder to pick up this grocery item: *${item.name}* (Qty: ${item.quantity}).`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${text}`).catch(() => {
      Alert.alert('Notice', 'Could not open WhatsApp.');
    });
  };

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
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle(item.id, item.isCompleted);
        }}
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
            <View style={styles.assigneeContainer}>
              <View style={[styles.assigneeBadge, { backgroundColor: (assignedMember?.color || colors.primary) + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }]}>
                <Ionicons name="person-outline" size={12} color={assignedMember?.color || colors.primary} />
                <Text style={[styles.assigneeText, { color: assignedMember?.color || colors.primary, fontWeight: '600' }]}>{getMemberDisplayName(item.assignedTo, members)}</Text>
              </View>
              {hasWhatsapp && (
                <TouchableOpacity
                  onPress={handleNotify}
                  style={styles.notifyButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                  <Text style={styles.notifyText}>Notify</Text>
                </TouchableOpacity>
              )}
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
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  notifyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
  },
  assigneeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
