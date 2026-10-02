export interface TaskCategoryConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const TASK_CATEGORIES: TaskCategoryConfig[] = [
  { id: 'tcat-chores', name: 'Household Chores', icon: 'home-outline', color: '#26A69A' },
  { id: 'tcat-maintenance', name: 'Maintenance', icon: 'construct-outline', color: '#FFA726' },
  { id: 'tcat-shopping', name: 'Shopping', icon: 'basket-outline', color: '#AB47BC' },
  { id: 'tcat-other', name: 'Other Tasks', icon: 'checkbox-outline', color: '#78909C' },
];
