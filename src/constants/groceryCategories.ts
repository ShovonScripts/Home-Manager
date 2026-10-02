export interface GroceryCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const GROCERY_CATEGORIES: GroceryCategory[] = [
  { id: 'vegetables', name: 'Vegetables', icon: 'leaf-outline', color: '#66BB6A' },
  { id: 'fruits', name: 'Fruits', icon: 'nutrition-outline', color: '#FFA726' },
  { id: 'meat_fish', name: 'Meat & Fish', icon: 'fish-outline', color: '#EF5350' },
  { id: 'dairy', name: 'Dairy', icon: 'water-outline', color: '#42A5F5' },
  { id: 'bakery', name: 'Bakery', icon: 'cafe-outline', color: '#8D6E63' },
  { id: 'beverages', name: 'Beverages', icon: 'beer-outline', color: '#AB47BC' },
  { id: 'snacks', name: 'Snacks', icon: 'fast-food-outline', color: '#FFCA28' },
  { id: 'household', name: 'Household', icon: 'home-outline', color: '#78909C' },
  { id: 'personal_care', name: 'Personal Care', icon: 'heart-outline', color: '#EC407A' },
  { id: 'other', name: 'Other', icon: 'basket-outline', color: '#9E9E9E' },
];
