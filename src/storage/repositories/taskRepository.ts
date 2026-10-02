import { getDatabase } from '../database';
import { Task, TaskCategory } from '../../types';

export const TaskRepository = {
  async getCategories(): Promise<TaskCategory[]> {
    const db = await getDatabase();
    return await db.getAllAsync<TaskCategory>('SELECT * FROM task_categories ORDER BY name ASC');
  },

  async getTasks(householdId: string): Promise<Task[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM tasks WHERE householdId = ? ORDER BY isCompleted ASC, dueDate ASC, createdAt DESC',
      [householdId]
    );

    return rows.map((row) => ({
      ...row,
      isCompleted: Boolean(row.isCompleted),
    }));
  },

  async addTask(task: Task): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO tasks (id, householdId, title, description, categoryId, assignedTo, dueDate, isCompleted, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        task.id,
        task.householdId,
        task.title,
        task.description || null,
        task.categoryId,
        task.assignedTo || null,
        task.dueDate || null,
        task.isCompleted ? 1 : 0,
        task.createdAt || now,
        now,
      ]
    );
  },

  async updateTask(task: Task): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'UPDATE tasks SET title = ?, description = ?, categoryId = ?, assignedTo = ?, dueDate = ?, isCompleted = ?, updatedAt = ? WHERE id = ?',
      [
        task.title,
        task.description || null,
        task.categoryId,
        task.assignedTo || null,
        task.dueDate || null,
        task.isCompleted ? 1 : 0,
        now,
        task.id,
      ]
    );
  },

  async deleteTask(taskId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [taskId]);
  },

  async toggleTask(taskId: string, isCompleted: boolean): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync('UPDATE tasks SET isCompleted = ?, updatedAt = ? WHERE id = ?', [
      isCompleted ? 1 : 0,
      now,
      taskId,
    ]);
  },
};
