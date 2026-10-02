import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Task, TaskCategory } from '../types';
import { TaskService } from '../services/taskService';
import { useHousehold } from './HouseholdContext';

export type TaskFilter = 'all' | 'pending' | 'completed' | 'today';

interface TaskState {
  tasks: Task[];
  categories: TaskCategory[];
  filter: TaskFilter;
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: { tasks: Task[]; categories: TaskCategory[] } }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: { id: string; isCompleted: boolean } }
  | { type: 'SET_FILTER'; payload: TaskFilter }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'SET_SEARCH'; payload: string };

const initialState: TaskState = {
  tasks: [],
  categories: [],
  filter: 'all',
  selectedCategory: null,
  searchQuery: '',
  isLoading: true,
  error: null,
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_DATA':
      return { ...state, tasks: action.payload.tasks, categories: action.payload.categories, isLoading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, isCompleted: action.payload.isCompleted } : t
        ),
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
}

interface TaskContextType extends TaskState {
  loadTasks: () => Promise<void>;
  addTask: (
    title: string,
    categoryId: string,
    description?: string,
    assignedTo?: string,
    dueDate?: number
  ) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string, currentStatus: boolean) => Promise<void>;
  setFilter: (filter: TaskFilter) => void;
  setCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  filteredTasks: Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { household } = useHousehold();

  const loadTasks = useCallback(async () => {
    if (!household) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await TaskService.loadTasksData(household.id);
      dispatch({ type: 'SET_DATA', payload: data });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to load tasks' });
    }
  }, [household]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (
    title: string,
    categoryId: string,
    description?: string,
    assignedTo?: string,
    dueDate?: number
  ) => {
    if (!household) return;
    try {
      const newTask = await TaskService.addTask(
        household.id,
        title,
        categoryId,
        description,
        assignedTo,
        dueDate
      );
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to add task' });
    }
  };

  const updateTask = async (task: Task) => {
    try {
      await TaskService.updateTask(task);
      dispatch({ type: 'UPDATE_TASK', payload: task });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to update task' });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId);
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to delete task' });
    }
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    dispatch({ type: 'TOGGLE_TASK', payload: { id: taskId, isCompleted: newStatus } });
    try {
      await TaskService.toggleTask(taskId, currentStatus);
    } catch (err: any) {
      dispatch({ type: 'TOGGLE_TASK', payload: { id: taskId, isCompleted: currentStatus } });
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to toggle task' });
    }
  };

  const setFilter = (filter: TaskFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const setCategory = (categoryId: string | null) => {
    dispatch({ type: 'SET_CATEGORY', payload: categoryId });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  // Date helper for today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTime = todayStart.getTime();

  // Filtered tasks
  const filteredTasks = state.tasks.filter((task) => {
    // Search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) || false;
      const matchAssignee = task.assignedTo?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
    }

    // Category filter
    if (state.selectedCategory && task.categoryId !== state.selectedCategory) {
      return false;
    }

    // Status filter
    if (state.filter === 'pending' && task.isCompleted) return false;
    if (state.filter === 'completed' && !task.isCompleted) return false;
    if (state.filter === 'today') {
      if (!task.dueDate) return false;
      const isToday = task.dueDate >= todayTime && task.dueDate < todayTime + 86400000;
      if (!isToday) return false;
    }

    return true;
  });

  return (
    <TaskContext.Provider
      value={{
        ...state,
        loadTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        setFilter,
        setCategory,
        setSearchQuery,
        filteredTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
