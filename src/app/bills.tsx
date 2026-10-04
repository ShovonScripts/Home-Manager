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
import { useBillStore } from '../store/useBillStore';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ErrorState, LoadingState } from '../components/common/AsyncState';
import { BillSummaryCard } from '../components/bills/BillSummaryCard';
import { BillCategoryChip } from '../components/bills/BillCategoryChip';
import { BillItemCard } from '../components/bills/BillItemCard';
import { BillModal } from '../components/bills/BillModal';
import { BillEmptyState } from '../components/bills/BillEmptyState';
import { BILL_CATEGORIES } from '../constants/billCategories';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function BillsScreenContent() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Spacing.sm);
  const tabBarHeight = 52 + bottomPadding;
  const household = useHouseholdStore(state => state.household);
  const {
    isLoading,
    error,
    loadData,
    bills,
    addBill,
    toggleBillPaid,
    deleteBill,
  } = useBillStore();

  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);

  React.useEffect(() => {
    if (household?.id) {
      loadData(household.id);
    }
  }, [household?.id, loadData]);

  const currencySymbol = household?.currency || '৳';

  const handleOpenAdd = () => {
    setIsModalVisible(true);
  };

  const handleSaveBill = (
    title: string,
    amount: number,
    dueDate: number,
    category: string,
    notes?: string
  ) => {
    if (household?.id) {
       addBill(household.id, title, amount, household.currency, dueDate, category, 'monthly', notes);
    }
    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Bill', 'Are you sure you want to delete this bill?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteBill(id),
      },
    ]);
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTime = todayStart.getTime();

  const filteredBills = bills.filter(b => {
    if (searchQuery.trim() && !b.title.toLowerCase().includes(searchQuery.toLowerCase()) && !b.notes?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory && b.category !== selectedCategory) return false;
    if (filter === 'unpaid') return !b.isPaid;
    if (filter === 'paid') return b.isPaid;
    if (filter === 'overdue') return !b.isPaid && b.dueDate < todayTime;
    return true;
  });

  const totalOutstanding = bills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = bills.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = bills.filter(b => !b.isPaid && b.dueDate < todayTime).reduce((sum, b) => sum + b.amount, 0);

  const statusFilters: { label: string; value: 'all' | 'unpaid' | 'paid' | 'overdue' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => { if (household) loadData(household.id) }} /> : (
        <>
          {/* Summary Card */}
          <BillSummaryCard
            totalOutstanding={totalOutstanding}
            totalPaid={totalPaid}
            totalOverdue={totalOverdue}
            currencySymbol={currencySymbol}
            onAddPress={handleOpenAdd}
          />

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Ionicons name="search" size={18} color={colors.outline} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.onSurface }]}
              placeholder="Search bills by title or notes..."
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

          {/* Status Filter Tabs */}
          <View style={[styles.statusFilterBar, { backgroundColor: colors.surfaceVariant }]}>
            {statusFilters.map((f) => {
              const isActive = filter === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  style={[
                    styles.statusTab,
                    isActive && { backgroundColor: colors.surface, shadowColor: colors.shadow },
                  ]}
                  onPress={() => setFilter(f.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`${f.label} bills`}
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    style={[
                      styles.statusTabText,
                      { color: isActive ? colors.primary : colors.onSurfaceVariant },
                      isActive && styles.activeStatusTabText,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Category Horizontal Scroll */}
          <View style={styles.categoryScrollContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={BILL_CATEGORIES}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                <BillCategoryChip
                  category={null}
                  isSelected={selectedCategory === null}
                  onPress={() => setSelectedCategory(null)}
                />
              }
              renderItem={({ item }) => (
                <BillCategoryChip
                  category={item}
                  isSelected={selectedCategory === item.name}
                  onPress={() => setSelectedCategory(selectedCategory === item.name ? null : item.name)}
                />
              )}
            />
          </View>

          {/* Bills List */}
          <FlatList
            data={filteredBills}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BillItemCard
                bill={item}
                onEdit={() => {}}
                onDelete={handleDelete}
                onTogglePaid={(id, isPaid) => toggleBillPaid(id, isPaid)}
              />
            )}
            ListEmptyComponent={
              <BillEmptyState
                message="No bills found matching your filters."
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
            accessibilityLabel="Add bill"
          >
            <Ionicons name="add" size={28} color={colors.onPrimary} />
          </TouchableOpacity>

        </>
      )}

      {/* Add Bill Modal */}
      <BillModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveBill}
      />
    </View>
  );
}

export default function BillsScreen() {
  return <BillsScreenContent />;
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
  statusFilterBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  statusTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  statusTabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeStatusTabText: {
    fontWeight: '700',
  },
  categoryScrollContainer: {
    marginBottom: Spacing.md,
    height: 40,
  },
  listContent: {
    paddingBottom: 80,
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
