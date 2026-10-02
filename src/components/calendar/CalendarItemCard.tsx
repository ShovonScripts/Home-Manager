import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ImportantDate } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { formatDate } from '../../utils/date';
import { Ionicons } from '@expo/vector-icons';
import { CALENDAR_CATEGORIES } from '../../constants/calendarCategories';

interface Props {
  item: ImportantDate;
  onEdit: (item: ImportantDate) => void;
  onDelete: (id: string) => void;
}

export const CalendarItemCard: React.FC<Props> = ({ item, onEdit, onDelete }) => {
  const { colors } = useTheme();
  const catConfig = CALENDAR_CATEGORIES.find((c) => c.name === item.category) || {
    label: 'Event',
    icon: 'calendar-outline',
    color: colors.primary,
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Main card content is touchable for editing */}
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => onEdit(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: catConfig.color + '20' }]}>
          <Ionicons name={catConfig.icon as any} size={22} color={catConfig.color} />
        </View>

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
              {item.title}
            </Text>
            {item.isRecurringYearly && (
              <View style={[styles.recurringBadge, { backgroundColor: colors.surfaceVariant }]}>
                <Ionicons name="repeat-outline" size={11} color={colors.outline} />
                <Text style={[styles.recurringText, { color: colors.outline }]}>Yearly</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.categoryName, { color: colors.outline }]}>{catConfig.label}</Text>
            <Text style={[styles.bullet, { color: colors.outline }]}>•</Text>
            <Text style={[styles.date, { color: colors.primary }]}>{formatDate(item.date)}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Delete button as a sibling touchable */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
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
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
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
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    gap: 3,
  },
  recurringText: {
    fontSize: 10,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
  },
  bullet: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
});
