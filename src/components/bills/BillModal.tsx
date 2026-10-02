import React, { useState, useEffect, useEffectEvent } from 'react';
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
import { useHousehold } from '../../context/HouseholdContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BILL_CATEGORIES } from '../../constants/billCategories';
import { Bill } from '../../types';

interface Props {
  visible: boolean;
  billToEdit?: Bill | null;
  onClose: () => void;
  onSave: (
    title: string,
    amount: number,
    dueDate: number,
    category: string,
    notes?: string
  ) => void;
}

export const BillModal: React.FC<Props> = ({ visible, billToEdit, onClose, onSave }) => {
  const { colors } = useTheme();
  const { household } = useHousehold();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [dueDateStr, setDueDateStr] = useState(''); // e.g. YYYY-MM-DD
  const [notes, setNotes] = useState('');

  const editingBillId = billToEdit?.id;
  const initializeForm = useEffectEvent(() => {
    if (billToEdit) {
      setTitle(billToEdit.title);
      setAmount(billToEdit.amount.toString());
      setCategory(billToEdit.category || 'Utilities');
      const d = new Date(billToEdit.dueDate);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setDueDateStr(`${yyyy}-${mm}-${dd}`);
      setNotes(billToEdit.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategory('Utilities');
      const d = new Date();
      d.setDate(d.getDate() + 7); // Default 7 days from now
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setDueDateStr(`${yyyy}-${mm}-${dd}`);
      setNotes('');
    }
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- An explicit modal session boundary initializes the draft once.
    if (visible) initializeForm();
  }, [visible, editingBillId]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a bill title.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0.');
      return;
    }

    let dueTimestamp = Date.now() + 7 * 86400000;
    if (dueDateStr.trim()) {
      const parsedDate = new Date(dueDateStr.trim());
      if (!isNaN(parsedDate.getTime())) {
        dueTimestamp = parsedDate.getTime();
      } else {
        Alert.alert('Validation Error', 'Please enter a valid due date (YYYY-MM-DD).');
        return;
      }
    }

    onSave(title.trim(), parsedAmount, dueTimestamp, category, notes.trim() || undefined);
    onClose();
  };

  const isEditing = Boolean(billToEdit);

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
              {isEditing ? 'Edit Bill' : 'Add Bill'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close bill form" hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Bill Title *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  borderColor: colors.outline,
                },
              ]}
              placeholder="e.g., Electricity Bill, House Rent"
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
              {BILL_CATEGORIES.map((cat) => {
                const isSelected = category === cat.name;
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
                    onPress={() => setCategory(cat.name)}
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

            {/* Due Date */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Due Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  borderColor: colors.outline,
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.outline}
              value={dueDateStr}
              onChangeText={setDueDateStr}
            />

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
              placeholder="Account number, reference, etc."
              placeholderTextColor={colors.outline}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel={isEditing ? 'Save bill' : 'Add bill'}
            >
              <Ionicons name={isEditing ? 'checkmark-circle' : 'add-circle'} size={20} color={colors.onPrimary} />
              <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>{isEditing ? 'Save Changes' : 'Add Bill'}</Text>
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
    fontSize: 16,
    fontWeight: '600',
  },
});
