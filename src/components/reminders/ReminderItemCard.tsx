import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Reminder } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { formatDate, formatTime } from '../../utils/date';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isCompleted: boolean) => void;
}

export const ReminderItemCard: React.FC<Props> = ({ reminder, onEdit, onDelete, onToggle }) => {
  const { colors } = useTheme();
  const isMedicine = reminder.type === 'medicine';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Checkbox / Completion Toggle */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => onToggle(reminder.id, reminder.isCompleted)}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: reminder.isCompleted ? colors.primary : colors.outline,
              backgroundColor: reminder.isCompleted ? colors.primary : 'transparent',
            },
          ]}
        >
          {reminder.isCompleted && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
        </View>
      </TouchableOpacity>

      {/* Main card content is touchable for editing */}
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => onEdit(reminder)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: isMedicine ? '#FF704320' : '#42A5F520' },
          ]}
        >
          <Ionicons
            name={isMedicine ? 'medical-outline' : 'notifications-outline'}
            size={20}
            color={isMedicine ? '#FF7043' : '#42A5F5'}
          />
        </View>

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: colors.onSurface },
                reminder.isCompleted && styles.completedText,
              ]}
              numberOfLines={1}
            >
              {reminder.title}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.typeBadge, { backgroundColor: isMedicine ? '#FF704320' : '#42A5F520' }]}>
              <Text
                style={[
                  styles.typeText,
                  { color: isMedicine ? '#FF7043' : '#42A5F5' },
                ]}
              >
                {isMedicine ? 'Medicine' : 'General'}
              </Text>
            </View>

            <Text style={[styles.bullet, { color: colors.outline }]}>•</Text>
            <Text style={[styles.dateTime, { color: colors.outline }]}>
              {formatDate(reminder.dateTime)} at {formatTime(reminder.dateTime)}
            </Text>

            {reminder.targetMemberId && (
              <>
                <Text style={[styles.bullet, { color: colors.outline }]}>•</Text>
                <Text style={[styles.member, { color: colors.primary }]}>{reminder.targetMemberId}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Delete button as a sibling touchable */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(reminder.id)}
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
  iconBox: {
    width: 40,
    height: 40,
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
  completedText: {
    textDecorationLine: 'line-through',
    color: '#8E9099',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bullet: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  dateTime: {
    fontSize: 11,
  },
  member: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
});
