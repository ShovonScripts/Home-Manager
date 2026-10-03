import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useGroceryStore } from '../../store/useGroceryStore';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useBillStore } from '../../store/useBillStore';
import { useReminderStore } from '../../store/useReminderStore';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type QuickType = 'task' | 'grocery' | 'expense' | 'bill' | 'reminder';

export const QuickAddModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const household = useHouseholdStore(state => state.household);
  const members = useHouseholdStore(state => state.members);

  const [type, setType] = useState<QuickType>('task');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Stores
  const addTask = useTaskStore(state => state.addTask);
  const taskCategories = useTaskStore(state => state.categories);

  const addGroceryItem = useGroceryStore(state => state.addItem);
  const groceryLists = useGroceryStore(state => state.lists);
  const activeListId = useGroceryStore(state => state.activeListId);

  const addExpense = useExpenseStore(state => state.addExpense);
  const expenseCategories = useExpenseStore(state => state.categories);

  const addBill = useBillStore(state => state.addBill);

  const addReminder = useReminderStore(state => state.addReminder);

  const currency = household?.currency || '৳';

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setQuantity('1');
    setAssignedTo(undefined);
    setSelectedCategory('');
  };

  const handleSave = async () => {
    if (!household) return;
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title or name.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      if (type === 'task') {
        const catId = selectedCategory || taskCategories[0]?.id || 'tcat-chores';
        await addTask(household.id, title.trim(), catId, undefined, assignedTo, Date.now() + 86400000);
      } else if (type === 'grocery') {
        const listId = activeListId || groceryLists[0]?.id || 'default-list';
        await addGroceryItem(listId, title.trim(), quantity, selectedCategory || 'General');
      } else if (type === 'expense') {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          Alert.alert('Error', 'Please enter a valid amount.');
          return;
        }
        const catId = selectedCategory || expenseCategories[0]?.id || 'cat-food';
        const paidByMember = assignedTo || members[0]?.name || 'Primary User';
        await addExpense(household.id, catId, title.trim(), numAmount, currency, paidByMember, Date.now());
      } else if (type === 'bill') {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          Alert.alert('Error', 'Please enter a valid bill amount.');
          return;
        }
        await addBill(household.id, title.trim(), numAmount, currency, Date.now() + 604800000, selectedCategory || 'Utilities', 'monthly');
      } else if (type === 'reminder') {
        await addReminder(household.id, title.trim(), Date.now() + 3600000, 'general', assignedTo);
      }

      resetForm();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save item.');
    }
  };

  const types: { id: QuickType; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { id: 'task', label: 'Task', icon: 'checkbox-outline', color: '#26A69A' },
    { id: 'grocery', label: 'Grocery', icon: 'basket-outline', color: '#66BB6A' },
    { id: 'expense', label: 'Expense', icon: 'wallet-outline', color: '#42A5F5' },
    { id: 'bill', label: 'Bill', icon: 'receipt-outline', color: '#FF7043' },
    { id: 'reminder', label: 'Reminder', icon: 'notifications-outline', color: '#AB47BC' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.headerIconBox, { backgroundColor: colors.primaryContainer }]}>
                <Ionicons name="flash" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Quick Add</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Type Selector Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {types.map((t) => {
              const isSelected = type === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: isSelected ? t.color : colors.surfaceVariant,
                      borderColor: isSelected ? t.color : colors.cardBorder,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setType(t.id);
                    setSelectedCategory('');
                  }}
                >
                  <Ionicons
                    name={t.icon}
                    size={16}
                    color={isSelected ? '#FFFFFF' : t.color}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: isSelected ? '#FFFFFF' : colors.onSurface },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title / Name */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
              {type === 'expense' || type === 'bill' ? 'Expense / Bill Title *' : type === 'grocery' ? 'Item Name *' : 'Title *'}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  borderColor: colors.outline,
                },
              ]}
              placeholder={
                type === 'task' ? 'e.g., Clean living room' :
                type === 'grocery' ? 'e.g., Organic Milk' :
                type === 'expense' ? 'e.g., Weekly Groceries' :
                type === 'bill' ? 'e.g., Internet Bill' : 'e.g., Take medicine'
              }
              placeholderTextColor={colors.outline}
              value={title}
              onChangeText={setTitle}
              autoFocus={true}
            />

            {/* Amount (for Expense & Bill) */}
            {(type === 'expense' || type === 'bill') && (
              <>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Amount ({currency}) *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceVariant,
                      color: colors.onSurface,
                      borderColor: colors.outline,
                    },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colors.outline}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </>
            )}

            {/* Quantity (for Grocery) */}
            {type === 'grocery' && (
              <>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Quantity</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceVariant,
                      color: colors.onSurface,
                      borderColor: colors.outline,
                    },
                  ]}
                  placeholder="e.g., 2 Ltrs, 1 kg"
                  placeholderTextColor={colors.outline}
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </>
            )}

            {/* Assign To / Paid By (for Task, Grocery, Reminder, Expense) */}
            {(type === 'task' || type === 'grocery' || type === 'reminder' || type === 'expense') && members.length > 0 && (
              <>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
                  {type === 'expense' ? 'Paid By' : 'Assign To'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  <TouchableOpacity
                    style={[
                      styles.memberChip,
                      {
                        backgroundColor: assignedTo === undefined ? colors.primary : colors.surfaceVariant,
                        borderColor: assignedTo === undefined ? colors.primary : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setAssignedTo(undefined)}
                  >
                    <Text style={[styles.chipText, { color: assignedTo === undefined ? '#FFFFFF' : colors.onSurface }]}>
                      {type === 'expense' ? 'Anyone' : 'Unassigned'}
                    </Text>
                  </TouchableOpacity>
                  {members.map((m) => {
                    const isSelected = assignedTo === m.name;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[
                          styles.memberChip,
                          {
                            backgroundColor: isSelected ? (m.color || colors.primary) : colors.surfaceVariant,
                            borderColor: isSelected ? (m.color || colors.primary) : colors.cardBorder,
                          },
                        ]}
                        onPress={() => setAssignedTo(m.name)}
                      >
                        <Ionicons name="person" size={12} color={isSelected ? '#FFFFFF' : (m.color || colors.primary)} style={{ marginRight: 4 }} />
                        <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.onSurface }]}>
                          {m.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save {type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '85%',
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  typeScroll: {
    marginBottom: Spacing.md,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.sm,
    height: 40,
    ...Shadows.sm,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  chipsScroll: {
    flexDirection: 'row',
    marginVertical: Spacing.xs,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.sm,
    height: 36,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: 8,
    ...Shadows.md,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
