import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { NoteService } from '../services/noteService';
import { useHousehold } from './HouseholdContext';

interface NoteState {
  notes: Note[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

type NoteAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_SEARCH'; payload: string };

const initialState: NoteState = {
  notes: [],
  searchQuery: '',
  isLoading: true,
  error: null,
};

function noteReducer(state: NoteState, action: NoteAction): NoteState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_NOTES':
      return { ...state, notes: action.payload, isLoading: false };
    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((n) => (n.id === action.payload.id ? action.payload : n)),
      };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter((n) => n.id !== action.payload) };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
}

interface NoteContextType extends NoteState {
  loadNotes: () => Promise<void>;
  addNote: (title: string, content: string) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  filteredNotes: Note[];
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(noteReducer, initialState);
  const { household } = useHousehold();

  const loadNotes = useCallback(async () => {
    if (!household) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const notes = await NoteService.loadNotes(household.id);
      dispatch({ type: 'SET_NOTES', payload: notes });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to load notes' });
    }
  }, [household]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const addNote = async (title: string, content: string) => {
    if (!household) return;
    try {
      const newNote = await NoteService.addNote(household.id, title, content);
      dispatch({ type: 'ADD_NOTE', payload: newNote });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to add note' });
    }
  };

  const updateNote = async (note: Note) => {
    try {
      await NoteService.updateNote(note);
      dispatch({ type: 'UPDATE_NOTE', payload: note });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to update note' });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await NoteService.deleteNote(noteId);
      dispatch({ type: 'DELETE_NOTE', payload: noteId });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to delete note' });
    }
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  const filteredNotes = state.notes.filter((note) => {
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchContent = note.content.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }
    return true;
  });

  return (
    <NoteContext.Provider
      value={{
        ...state,
        loadNotes,
        addNote,
        updateNote,
        deleteNote,
        setSearchQuery,
        filteredNotes,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export const useNote = (): NoteContextType => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNote must be used within a NoteProvider');
  }
  return context;
};
