import { create } from 'zustand';
import { Task, TaskCategory } from '../types';
import { TaskService } from '../services/taskService';

export type TaskFilter = 'all' | 'pending' | 'completed' | 'today';

interface TaskState {
  tasks: Task[];
  categories: TaskCategory[];
  filter: TaskFilter;
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTasks: (householdId: string) => Promise<void>;
  addTask: (
    householdId: string,
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
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  categories: [],
  filter: 'all',
  selectedCategory: null,
  searchQuery: '',
  isLoading: true,
  error: null,

  loadTasks: async (householdId: string) => {
    try {
      set({ isLoading: true, error: null });
      const data = await TaskService.loadTasksData(householdId);
      set({ tasks: data.tasks, categories: data.categories, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load tasks', isLoading: false });
    }
  },

  addTask: async (householdId, title, categoryId, description, assignedTo, dueDate) => {
    try {
      const newTask = await TaskService.addTask(
        householdId,
        title,
        categoryId,
        description,
        assignedTo,
        dueDate
      );
      set((state) => ({ tasks: [newTask, ...state.tasks] }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to add task' });
    }
  },

  updateTask: async (task: Task) => {
    try {
      await TaskService.updateTask(task);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update task' });
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete task' });
    }
  },

  toggleTask: async (taskId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: newStatus } : t
      ),
    }));

    try {
      await TaskService.toggleTask(taskId, currentStatus);
    } catch (err: any) {
      // Revert on failure
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, isCompleted: currentStatus } : t
        ),
        error: err?.message || 'Failed to toggle task',
      }));
    }
  },

  setFilter: (filter: TaskFilter) => set({ filter }),
  setCategory: (categoryId: string | null) => set({ selectedCategory: categoryId }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));

// Helper selector to get filtered tasks
export const useFilteredTasks = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const filter = useTaskStore((state) => state.filter);
  const selectedCategory = useTaskStore((state) => state.selectedCategory);
  const searchQuery = useTaskStore((state) => state.searchQuery);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTime = todayStart.getTime();

  return tasks.filter((task) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) || false;
      const matchAssignee = task.assignedTo?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
    }

    // Category filter
    if (selectedCategory && task.categoryId !== selectedCategory) {
      return false;
    }

    // Status filter
    if (filter === 'pending' && task.isCompleted) return false;
    if (filter === 'completed' && !task.isCompleted) return false;
    if (filter === 'today') {
      if (!task.dueDate) return false;
      const isToday = task.dueDate >= todayTime && task.dueDate < todayTime + 86400000;
      if (!isToday) return false;
    }

    return true;
  });
};
