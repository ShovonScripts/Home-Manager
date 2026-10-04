import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Note } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { formatDate } from '../../utils/date';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export const NoteItemCard: React.FC<Props> = ({ note, onEdit, onDelete }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Main card content is touchable for editing */}
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => onEdit(note)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
        </View>

        <View style={styles.details}>
          <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
            {note.title}
          </Text>
          <Text style={[styles.content, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
            {note.content}
          </Text>
          <Text style={[styles.date, { color: colors.outline }]}>
            Updated: {formatDate(note.updatedAt)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Delete button as a sibling touchable */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(note.id)}
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
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  details: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
  },
  deleteButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
});
