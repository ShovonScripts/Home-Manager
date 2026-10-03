import { create } from 'zustand';
import { Note } from '../types';
import { getDatabase } from '../storage/database';

interface NoteState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;

  loadData: (householdId: string) => Promise<void>;
  addNote: (householdId: string, title: string, content: string) => Promise<void>;
  updateNote: (noteId: string, title: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  isLoading: true,
  error: null,

  loadData: async (householdId: string) => {
    try {
      set({ isLoading: true, error: null });
      const db = await getDatabase();

      const notes = await db.getAllAsync<Note>(
        'SELECT * FROM notes WHERE householdId = ? ORDER BY updatedAt DESC',
        [householdId]
      );

      set({ notes, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load notes', isLoading: false });
    }
  },

  addNote: async (householdId, title, content) => {
    try {
      const db = await getDatabase();
      const now = Date.now();
      const newNote: Note = {
        id: `note-${now}-${Math.random().toString(36).substr(2, 4)}`,
        householdId,
        title: title.trim(),
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
      };

      await db.runAsync(
        'INSERT INTO notes (id, householdId, title, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [newNote.id, newNote.householdId, newNote.title, newNote.content, newNote.createdAt, newNote.updatedAt]
      );

      set((state) => ({
        notes: [newNote, ...state.notes]
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to add note' });
    }
  },

  updateNote: async (noteId, title, content) => {
    try {
      const db = await getDatabase();
      const now = Date.now();

      await db.runAsync(
        'UPDATE notes SET title = ?, content = ?, updatedAt = ? WHERE id = ?',
        [title.trim(), content.trim(), now, noteId]
      );

      set((state) => ({
        notes: state.notes.map(n =>
          n.id === noteId ? { ...n, title: title.trim(), content: content.trim(), updatedAt: now } : n
        ).sort((a, b) => b.updatedAt - a.updatedAt)
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update note' });
    }
  },

  deleteNote: async (noteId: string) => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM notes WHERE id = ?', [noteId]);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== noteId),
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete note' });
    }
  },
}));
