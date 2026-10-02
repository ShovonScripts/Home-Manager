export interface CalendarCategoryConfig {
  id: string;
  name: 'birthday' | 'anniversary' | 'event';
  label: string;
  icon: string;
  color: string;
}

export const CALENDAR_CATEGORIES: CalendarCategoryConfig[] = [
  { id: 'cat-birthday', name: 'birthday', label: 'Birthday', icon: 'gift-outline', color: '#EC407A' },
  { id: 'cat-anniversary', name: 'anniversary', label: 'Anniversary', icon: 'heart-outline', color: '#AB47BC' },
  { id: 'cat-event', name: 'event', label: 'Event', icon: 'calendar-outline', color: '#42A5F5' },
];
