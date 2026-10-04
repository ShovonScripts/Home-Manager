import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHouseholdStore } from '../store/useHouseholdStore';
import { useNoteStore } from '../store/useNoteStore';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NoteItemCard } from '../components/notes/NoteItemCard';
import { NoteModal } from '../components/notes/NoteModal';
import { NoteEmptyState } from '../components/notes/NoteEmptyState';
import { Note } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function NotesScreenContent() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Spacing.sm);
  const tabBarHeight = 52 + bottomPadding;
  const household = useHouseholdStore(state => state.household);
  const {
    loadData,
    notes,
    addNote,
    updateNote,
    deleteNote,
  } = useNoteStore();

  const [searchQuery, setSearchQuery] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  React.useEffect(() => {
    if (household?.id) {
      loadData(household.id);
    }
  }, [household?.id, loadData]);

  const handleOpenAdd = () => {
    setEditingNote(null);
    setIsModalVisible(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalVisible(true);
  };

  const handleSaveNote = (title: string, content: string) => {
    if (editingNote) {
      updateNote(editingNote.id, title, content);
    } else {
      if (household?.id) {
        addNote(household.id, title, content);
      }
    }
    setEditingNote(null);
    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteNote(id),
      },
    ]);
  };

  const filteredNotes = notes.filter(n => {
    if (searchQuery.trim() && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <Ionicons name="search" size={18} color={colors.outline} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder="Search notes..."
          placeholderTextColor={colors.outline}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.outline} />
          </TouchableOpacity>
        )}
      </View>

      {/* Action Header (Item count) */}
      <View style={styles.actionHeader}>
        <Text style={[styles.itemCountText, { color: colors.outline }]}>
          Showing {filteredNotes.length} of {notes.length} notes
        </Text>
      </View>

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteItemCard
            note={item}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={<NoteEmptyState message="No shared notes found matching your search." />}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow, bottom: tabBarHeight + Spacing.md }]}
        onPress={handleOpenAdd}
        accessibilityRole="button"
        accessibilityLabel="Add note"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add / Edit Note Modal */}
      <NoteModal
        key={editingNote?.id || 'new-note'}
        visible={isModalVisible}
        noteToEdit={editingNote}
        onClose={() => {
          setIsModalVisible(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
      />
    </View>
  );
}

export default function NotesScreen() {
  return <NotesScreenContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: 4,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    width: 60,
    height: 60,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
});
