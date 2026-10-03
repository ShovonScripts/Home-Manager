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
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Task, TaskCategory } from '../../types';

interface Props {
  visible: boolean;
  taskToEdit?: Task | null;
  categories: TaskCategory[];
  onClose: () => void;
  onSave: (
    title: string,
    categoryId: string,
    description?: string,
    assignedTo?: string,
    dueDate?: number
  ) => void;
}

export const TaskModal: React.FC<Props> = ({
  visible,
  taskToEdit,
  categories,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const members = useHouseholdStore(state => state.members);

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [categoryId, setCategoryId] = useState(taskToEdit?.categoryId || categories[0]?.id || '');
  const [assignedTo, setAssignedTo] = useState<string | undefined>(taskToEdit?.assignedTo);
  const [dueDateStr, setDueDateStr] = useState(() => {
    if (taskToEdit?.dueDate) {
      const d = new Date(taskToEdit.dueDate);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return '';
  });



  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a task title.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Validation Error', 'Please select a task category.');
      return;
    }

    let dueTimestamp: number | undefined = undefined;
    if (dueDateStr.trim()) {
      const parsedDate = new Date(dueDateStr.trim());
      if (!isNaN(parsedDate.getTime())) {
        dueTimestamp = parsedDate.getTime();
      } else {
        Alert.alert('Validation Error', 'Please enter a valid due date (YYYY-MM-DD).');
        return;
      }
    }

    onSave(
      title.trim(),
      categoryId,
      description.trim() || undefined,
      assignedTo,
      dueTimestamp
    );
    onClose();
  };

  const isEditing = Boolean(taskToEdit);

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
              {isEditing ? 'Edit Task' : 'Add Task'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Task Title *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  borderColor: colors.outline,
                },
              ]}
              placeholder="e.g., Take out recycling, Clean kitchen"
              placeholderTextColor={colors.outline}
              value={title}
              onChangeText={setTitle}
              autoFocus={true}
            />

            {/* Description */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Description (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  borderColor: colors.outline,
                  height: 80,
                  textAlignVertical: 'top',
                  paddingTop: Spacing.sm,
                },
              ]}
              placeholder="Additional details..."
              placeholderTextColor={colors.outline}
              multiline
              value={description}
              onChangeText={setDescription}
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
                      name="checkbox-outline"
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
                const isSelected = assignedTo === member.name;
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
                    onPress={() => setAssignedTo(member.name)}
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



            {/* Due Date */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Due Date (YYYY-MM-DD, Optional)</Text>
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

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Ionicons name={isEditing ? 'checkmark-circle' : 'add-circle'} size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>{isEditing ? 'Save Changes' : 'Add Task'}</Text>
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  switchTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
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
