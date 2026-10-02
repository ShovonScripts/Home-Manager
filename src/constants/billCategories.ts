export interface BillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const BILL_CATEGORIES: BillCategory[] = [
  { id: 'utilities', name: 'Utilities', icon: 'flash-outline', color: '#42A5F5' },
  { id: 'housing', name: 'Housing', icon: 'home-outline', color: '#66BB6A' },
  { id: 'internet', name: 'Internet', icon: 'wifi-outline', color: '#AB47BC' },
  { id: 'mobile', name: 'Mobile', icon: 'phone-portrait-outline', color: '#FF7043' },
  { id: 'subscription', name: 'Subscription', icon: 'tv-outline', color: '#EC407A' },
  { id: 'other', name: 'Other', icon: 'receipt-outline', color: '#78909C' },
];
