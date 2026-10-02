import { NoteRepository } from '../storage/repositories/noteRepository';
import { Note } from '../types';

export const NoteService = {
  async loadNotes(householdId: string): Promise<Note[]> {
    return await NoteRepository.getNotes(householdId);
  },

  async addNote(
    householdId: string,
    title: string,
    content: string
  ): Promise<Note> {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      householdId,
      title: title.trim(),
      content: content.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await NoteRepository.addNote(newNote);
    return newNote;
  },

  async updateNote(note: Note): Promise<void> {
    await NoteRepository.updateNote(note);
  },

  async deleteNote(noteId: string): Promise<void> {
    await NoteRepository.deleteNote(noteId);
  },
};
