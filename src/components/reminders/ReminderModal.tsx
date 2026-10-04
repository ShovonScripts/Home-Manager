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
import Ionicons from '@expo/vector-icons/Ionicons';
import { Reminder } from '../../types';

interface Props {
  visible: boolean;
  reminderToEdit?: Reminder | null;
  onClose: () => void;
  onSave: (
    title: string,
    dateTime: number,
    type: 'medicine' | 'general',
    targetMemberId?: string
  ) => void;
}

export const ReminderModal: React.FC<Props> = ({
  visible,
  reminderToEdit,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const members = useHouseholdStore(state => state.members);

  const [title, setTitle] = useState(reminderToEdit?.title || '');
  const [type, setType] = useState<'medicine' | 'general'>(reminderToEdit?.type || 'general');
  const [targetMemberId, setTargetMemberId] = useState<string | undefined>(
    reminderToEdit?.targetMemberId
  );
  const [dateStr, setDateStr] = useState(() => {
    if (reminderToEdit?.dateTime) {
      const d = new Date(reminderToEdit.dateTime);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [timeStr, setTimeStr] = useState(() => {
    if (reminderToEdit?.dateTime) {
      const d = new Date(reminderToEdit.dateTime);
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${min}`;
    }
    return '09:00';
  });

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a reminder title.');
      return;
    }

    let timestamp = Date.now() + 3600000; // 1 hour from now default
    try {
      const [year, month, day] = dateStr.trim().split('-').map(Number);
      const [hour, minute] = timeStr.trim().split(':').map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hour) && !isNaN(minute)) {
        const d = new Date(year, month - 1, day, hour, minute, 0);
        timestamp = d.getTime();
      } else {
        Alert.alert('Validation Error', 'Please enter valid date (YYYY-MM-DD) and time (HH:MM).');
        return;
      }
    } catch {
      Alert.alert('Validation Error', 'Please enter valid date and time format.');
      return;
    }

    onSave(title.trim(), timestamp, type, targetMemberId);
    onClose();
  };

  const isEditing = Boolean(reminderToEdit);

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
              {isEditing ? 'Edit Reminder' : 'Add Reminder'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Reminder Title *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  color: colors.onSurface,
                  borderColor: colors.outline,
                },
              ]}
              placeholder="e.g., Blood Pressure Medication, Water plants"
              placeholderTextColor={colors.outline}
              value={title}
              onChangeText={setTitle}
              autoFocus={true}
            />

            {/* Type Selection */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Type</Text>
            <View style={styles.typeRow}>
              {(['general', 'medicine'] as const).map((t) => {
                const isSelected = type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setType(t)}
                  >
                    <Ionicons
                      name={t === 'medicine' ? 'medical-outline' : 'notifications-outline'}
                      size={16}
                      color={isSelected ? colors.onPrimary : colors.onSurface}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        { color: isSelected ? colors.onPrimary : colors.onSurface },
                      ]}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date & Time */}
            <View style={styles.dateTimeRow}>
              <View style={{ flex: 1, marginRight: Spacing.sm }}>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Date (YYYY-MM-DD)</Text>
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
                  value={dateStr}
                  onChangeText={setDateStr}
                />
              </View>
              <View style={{ width: 110 }}>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Time (HH:MM)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surfaceVariant,
                      color: colors.onSurface,
                      borderColor: colors.outline,
                    },
                  ]}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.outline}
                  value={timeStr}
                  onChangeText={setTimeStr}
                />
              </View>
            </View>

            {/* Target Member Assignment */}
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Assign To</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: targetMemberId === undefined ? colors.primary : colors.surfaceVariant,
                    borderColor: targetMemberId === undefined ? colors.primary : colors.cardBorder,
                  },
                ]}
                onPress={() => setTargetMemberId(undefined)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: targetMemberId === undefined ? colors.onPrimary : colors.onSurface },
                  ]}
                >
                  Household (All)
                </Text>
              </TouchableOpacity>
              {members.map((member) => {
                const isSelected = targetMemberId === member.name;
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
                    onPress={() => setTargetMemberId(member.name)}
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
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Ionicons name={isEditing ? 'checkmark-circle' : 'add-circle'} size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>{isEditing ? 'Save Changes' : 'Add Reminder'}</Text>
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
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
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
