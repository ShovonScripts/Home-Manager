import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHouseholdStore } from '../store/useHouseholdStore';
import { useGroceryStore, useActiveListItems } from '../store/useGroceryStore';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState, LoadingState } from '../components/common/AsyncState';
import { GroceryFilterBar } from '../components/grocery/GroceryFilterBar';
import { GroceryItemCard } from '../components/grocery/GroceryItemCard';
import { GroceryCategoryChip } from '../components/grocery/GroceryCategoryChip';
import { GroceryItemModal } from '../components/grocery/GroceryItemModal';
import { GroceryEmptyState } from '../components/grocery/GroceryEmptyState';
import { GROCERY_CATEGORIES } from '../constants/groceryCategories';
import { GroceryItem } from '../types';

function GroceryScreenContent() {
  const { colors } = useTheme();
  const household = useHouseholdStore(state => state.household);
  const {
    isLoading,
    error,
    loadData,
    activeListId,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
  } = useGroceryStore();

  const items = useActiveListItems();

  // Local state for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setCategory] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);

  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Spacing.sm);
  const tabBarHeight = 52 + bottomPadding;

  React.useEffect(() => {
    if (household?.id) {
      loadData(household.id);
    }
  }, [household?.id, loadData]);

  const completedCount = items.filter((i) => i.isCompleted).length;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalVisible(true);
  };

  const handleOpenEdit = (item: GroceryItem) => {
    setEditingItem(item);
    setIsModalVisible(true);
  };

  const handleSaveItem = (name: string, quantity: string, category: string, assignedTo?: string) => {
    if (editingItem) {
      updateItem({
        ...editingItem,
        name,
        quantity,
        category,
        assignedTo,
      });
    } else {
      const targetListId = activeListId || '';
      addItem(targetListId, name, quantity, category, assignedTo);
    }
    setEditingItem(null);
  };

  const handleClearCompleted = () => {
    if (completedCount === 0) return;
    Alert.alert(
      'Clear Completed Items',
      `Are you sure you want to remove all ${completedCount} completed items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
             items.filter(i => i.isCompleted).forEach(i => deleteItem(i.id));
          },
        },
      ]
    );
  };

  const filteredItems = items.filter(item => {
    if (searchQuery.trim() && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (filter === 'pending' && item.isCompleted) return false;
    if (filter === 'completed' && !item.isCompleted) return false;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => { if (household) loadData(household.id) }} /> : (
        <>
          {/* Search & Header Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Ionicons name="search" size={18} color={colors.outline} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.onSurface }]}
              placeholder="Search grocery items..."
              placeholderTextColor={colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.outline} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Tabs */}
          <GroceryFilterBar filter={filter} setFilter={setFilter} />

          {/* Category Horizontal Scroll */}
          <View style={styles.categoryScrollContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={GROCERY_CATEGORIES}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                <GroceryCategoryChip
                  categoryName="All Categories"
                  isSelected={selectedCategory === null}
                  onPress={() => setCategory(null)}
                />
              }
              renderItem={({ item }) => (
                <GroceryCategoryChip
                  categoryName={item.name}
                  isSelected={selectedCategory === item.name}
                  onPress={() => setCategory(selectedCategory === item.name ? null : item.name)}
                />
              )}
            />
          </View>

          {/* Action Header (Item count & Clear completed) */}
          <View style={styles.actionHeader}>
            <Text style={[styles.itemCountText, { color: colors.outline }]}>
              Showing {filteredItems.length} of {items.length} items
            </Text>
            {completedCount > 0 && (
              <TouchableOpacity onPress={handleClearCompleted} accessibilityRole="button" accessibilityLabel={`Clear ${completedCount} completed grocery items`}>
                <Text style={[styles.clearText, { color: colors.error }]}>
                  Clear Completed ({completedCount})
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Grocery Items List (Optimized FlatList) */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <GroceryItemCard
                item={item}
                onToggle={toggleItem}
                onDelete={deleteItem}
                onEdit={handleOpenEdit}
              />
            )}
            ListEmptyComponent={
              <GroceryEmptyState
                message="No grocery items found matching your filters."
                onAction={handleOpenAdd}
              />
            }
            contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + Spacing.lg }]}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
          />

          {/* Floating Action Button (FAB) */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow, bottom: tabBarHeight + Spacing.md }]}
            onPress={handleOpenAdd}
            accessibilityRole="button"
            accessibilityLabel="Add grocery item"
          >
            <Ionicons name="add" size={28} color={colors.onPrimary} />
          </TouchableOpacity>

        </>
      )}

      {/* Reusable Add / Edit Item Modal */}
      <GroceryItemModal
        visible={isModalVisible}
        itemToEdit={editingItem}
        onClose={() => {
          setIsModalVisible(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
      />
    </View>
  );
}

export default function GroceryScreen() {
  return <GroceryScreenContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  categoryScrollContainer: {
    marginBottom: Spacing.md,
    height: 40,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    width: 60,
    height: 60,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
});
