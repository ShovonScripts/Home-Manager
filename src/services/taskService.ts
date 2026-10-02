import { TaskRepository } from '../storage/repositories/taskRepository';
import { Task, TaskCategory } from '../types';

export const TaskService = {
  async loadTasksData(householdId: string): Promise<{ tasks: Task[]; categories: TaskCategory[] }> {
    const tasks = await TaskRepository.getTasks(householdId);
    const categories = await TaskRepository.getCategories();
    return { tasks, categories };
  },

  async addTask(
    householdId: string,
    title: string,
    categoryId: string,
    description?: string,
    assignedTo?: string,
    dueDate?: number
  ): Promise<Task> {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      householdId,
      title: title.trim(),
      description: description?.trim() || undefined,
      categoryId,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate || undefined,
      isCompleted: false,
      createdAt: Date.now(),
    };
    await TaskRepository.addTask(newTask);
    return newTask;
  },

  async updateTask(task: Task): Promise<void> {
    await TaskRepository.updateTask(task);
  },

  async deleteTask(taskId: string): Promise<void> {
    await TaskRepository.deleteTask(taskId);
  },

  async toggleTask(taskId: string, currentStatus: boolean): Promise<void> {
    await TaskRepository.toggleTask(taskId, !currentStatus);
  },
};
