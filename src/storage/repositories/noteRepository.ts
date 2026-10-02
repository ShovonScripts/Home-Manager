import { getDatabase } from '../database';
import { Note } from '../../types';

export const NoteRepository = {
  async getNotes(householdId: string): Promise<Note[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Note>(
      'SELECT * FROM notes WHERE householdId = ? ORDER BY updatedAt DESC, createdAt DESC',
      [householdId]
    );
  },

  async addNote(note: Note): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO notes (id, householdId, title, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [
        note.id,
        note.householdId,
        note.title,
        note.content,
        note.createdAt || now,
        now,
      ]
    );
  },

  async updateNote(note: Note): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'UPDATE notes SET title = ?, content = ?, updatedAt = ? WHERE id = ?',
      [
        note.title,
        note.content,
        now,
        note.id,
      ]
    );
  },

  async deleteNote(noteId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM notes WHERE id = ?', [noteId]);
  },
};
