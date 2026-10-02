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
import { NoteProvider, useNote } from '../context/NoteContext';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { NoteItemCard } from '../components/notes/NoteItemCard';
import { NoteModal } from '../components/notes/NoteModal';
import { NoteEmptyState } from '../components/notes/NoteEmptyState';
import { Note } from '../types';

function NotesScreenContent() {
  const { colors } = useTheme();
  const {
    notes,
    filteredNotes,
    searchQuery,
    setSearchQuery,
    addNote,
    updateNote,
    deleteNote,
  } = useNote();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

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
      updateNote({
        ...editingNote,
        title,
        content,
      });
    } else {
      addNote(title, content);
    }
    setEditingNote(null);
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Bar with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Shared Household Notes</Text>
          <Text style={[styles.headerSubtitle, { color: colors.outline }]}>
            Family noticeboard & important shared info
          </Text>
        </View>
      </View>

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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
        onPress={handleOpenAdd}
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
  return (
    <NoteProvider>
      <NotesScreenContent />
    </NoteProvider>
  );
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
