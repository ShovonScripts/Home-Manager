import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useHousehold } from '../../context/HouseholdContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Expense, ExpenseCategory } from '../../types';

interface Props {
  visible: boolean;
  expenseToEdit?: Expense | null;
  categories: ExpenseCategory[];
  onClose: () => void;
  onSave: (
    categoryId: string,
    title: string,
    amount: number,
    paidBy: string,
    date: number,
    notes?: string
  ) => void;
}

export const ExpenseItemModal: React.FC<Props> = ({
  visible,
  expenseToEdit,
  categories,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const { members, household } = useHousehold();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmount(expenseToEdit.amount.toString());
      setCategoryId(expenseToEdit.categoryId);
      setPaidBy(expenseToEdit.paidBy);
      setNotes(expenseToEdit.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      setPaidBy(members[0]?.name || 'Primary User');
      setNotes('');
    }
  }, [expenseToEdit, visible, categories, members]);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !categoryId) return;

    onSave(
      categoryId,
      title.trim(),
      parsedAmount,
      paidBy || members[0]?.name || 'Primary User',
      expenseToEdit ? expenseToEdit.date : Date.now(),
      notes.trim() || undefined
    );
    onClose();
  };

  const isEditing = Boolean(expenseToEdit);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
              {isEditing ? 'Edit Expense' : 'Add Expense'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Title / Description *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  borderColor: colors.outline,
                },
              ]}
              placeholder="e.g., Weekly Groceries, Electric Bill"
              placeholderTextColor={colors.outline}
              value={title}
              onChangeText={setTitle}
              autoFocus={true}
            />

            {/* Amount */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
              Amount ({household?.currency || '৳'}) *
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
              placeholder="0.00"
              placeholderTextColor={colors.outline}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            {/* Category Selection */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={isSelected ? colors.onPrimary : cat.color}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? colors.onPrimary : colors.onSurface },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Paid By Selection */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Paid By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {members.map((member) => {
                const isSelected = paidBy === member.name;
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setPaidBy(member.name)}
                  >
                    <Ionicons
                      name="person-outline"
                      size={14}
                      color={isSelected ? colors.onPrimary : colors.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? colors.onPrimary : colors.onSurface },
                      ]}
                    >
                      {member.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Notes */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Notes (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  borderColor: colors.outline,
                },
              ]}
              placeholder="Additional details..."
              placeholderTextColor={colors.outline}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.primary,
                  opacity: title.trim() && amount && !isNaN(Number(amount)) ? 1 : 0.6,
                },
              ]}
              disabled={!title.trim() || !amount || isNaN(Number(amount))}
              onPress={handleSave}
            >
              <Ionicons name={isEditing ? 'checkmark-circle' : 'add-circle'} size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Save Expense' : 'Add Expense'}
              </Text>
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
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.xs,
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
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.sm,
    height: 38,
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
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
