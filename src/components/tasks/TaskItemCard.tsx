import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Task, TaskCategory } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { formatDate } from '../../utils/date';
import { Ionicons } from '@expo/vector-icons';
import { TASK_CATEGORIES } from '../../constants/taskCategories';

interface Props {
  task: Task;
  categories: TaskCategory[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isCompleted: boolean) => void;
}

export const TaskItemCard: React.FC<Props> = ({ task, categories, onEdit, onDelete, onToggle }) => {
  const { colors } = useTheme();
  const category = categories.find((c) => c.id === task.categoryId);
  const config = TASK_CATEGORIES.find((c) => c.name === (category?.name || '')) || {
    icon: 'checkbox-outline',
    color: colors.primary,
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTime = todayStart.getTime();

  const isDueToday = task.dueDate && task.dueDate >= todayTime && task.dueDate < todayTime + 86400000;
  const isOverdue = task.dueDate && !task.isCompleted && task.dueDate < todayTime;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Checkbox / Completion Toggle */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => onToggle(task.id, task.isCompleted)}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: task.isCompleted ? colors.primary : colors.outline,
              backgroundColor: task.isCompleted ? colors.primary : 'transparent',
            },
          ]}
        >
          {task.isCompleted && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
        </View>
      </TouchableOpacity>

      {/* Main card content is touchable for editing */}
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => onEdit(task)}
        activeOpacity={0.7}
      >
        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                { color: colors.onSurface },
                task.isCompleted && styles.completedText,
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
          </View>

          {task.description && (
            <Text
              style={[styles.description, { color: colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}

          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Ionicons name={config.icon as any} size={12} color={config.color} />
              <Text style={[styles.categoryName, { color: colors.outline }]}>
                {category?.name || 'Task'}
              </Text>
            </View>

            {task.dueDate && (
              <>
                <Text style={[styles.bullet, { color: colors.outline }]}>•</Text>
                <Text
                  style={[
                    styles.dueDate,
                    { color: isOverdue ? colors.error : isDueToday ? colors.warning : colors.outline },
                  ]}
                >
                  {isOverdue ? 'Overdue: ' : isDueToday ? 'Due Today: ' : 'Due: '}
                  {formatDate(task.dueDate)}
                </Text>
              </>
            )}

            {task.assignedTo && (
              <>
                <Text style={[styles.bullet, { color: colors.outline }]}>•</Text>
                <Text style={[styles.assignedTo, { color: colors.primary }]}>{task.assignedTo}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Delete button as a sibling touchable */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
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
  details: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
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
  description: {
    fontSize: 13,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryName: {
    fontSize: 11,
  },
  bullet: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  dueDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  assignedTo: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
});
