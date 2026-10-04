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
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useHouseholdStore } from '../../store/useHouseholdStore';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GROCERY_CATEGORIES } from '../../constants/groceryCategories';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, quantity: string, category: string, assignedTo?: string) => void;
}

export const AddGroceryItemModal: React.FC<Props> = ({ visible, onClose, onAdd }) => {
  const { colors } = useTheme();
  const members = useHouseholdStore(state => state.members);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('Vegetables');
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);

  const handleSave = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), quantity.trim() || '1', category, assignedTo);
    setName('');
    setQuantity('1');
    setCategory('Vegetables');
    setAssignedTo(undefined);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Add Grocery Item</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close grocery form" hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Item Name */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Item Name *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  borderColor: colors.outline,
                },
              ]}
              placeholder="e.g., Organic Milk, Fresh Spinach"
              placeholderTextColor={colors.outline}
              value={name}
              onChangeText={setName}
              autoFocus={true}
            />

            {/* Quantity */}
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
              placeholder="e.g., 2 Liters, 1 kg, 3 packs"
              placeholderTextColor={colors.outline}
              value={quantity}
              onChangeText={setQuantity}
            />

            {/* Category Selection */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {GROCERY_CATEGORIES.map((cat) => {
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

            {/* Assign To Selection */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Assign To</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: assignedTo === undefined ? colors.primary : colors.surfaceVariant,
                    borderColor: assignedTo === undefined ? colors.primary : colors.cardBorder,
                  },
                ]}
                accessibilityRole="radio"
                accessibilityLabel="Unassigned"
                accessibilityState={{ checked: assignedTo === undefined }}
                onPress={() => setAssignedTo(undefined)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: assignedTo === undefined ? colors.onPrimary : colors.onSurface },
                  ]}
                >
                  Unassigned
                </Text>
              </TouchableOpacity>
              {members.map((member) => {
                const isSelected = assignedTo === member.id;
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
                    accessibilityRole="radio"
                    accessibilityLabel={`Assign to ${member.name}`}
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => setAssignedTo(member.id)}
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

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary, opacity: name.trim() ? 1 : 0.6 },
              ]}
              disabled={!name.trim()}
              accessibilityRole="button"
              accessibilityLabel="Add grocery item"
              accessibilityState={{ disabled: !name.trim() }}
              onPress={handleSave}
            >
              <Ionicons name="add-circle" size={20} color={colors.onPrimary} />
              <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>Add to Grocery List</Text>
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
