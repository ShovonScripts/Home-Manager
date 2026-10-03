import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHouseholdStore } from '../store/useHouseholdStore';
import { useExpenseStore } from '../store/useExpenseStore';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ErrorState, LoadingState } from '../components/common/AsyncState';
import { ExpenseSummaryCard } from '../components/expenses/ExpenseSummaryCard';
import { ExpenseCategoryChip } from '../components/expenses/ExpenseCategoryChip';
import { ExpenseItemCard } from '../components/expenses/ExpenseItemCard';
import { ExpenseItemModal } from '../components/expenses/ExpenseItemModal';
import { ExpenseEmptyState } from '../components/expenses/ExpenseEmptyState';
import { ExpenseAnalyticsCard } from '../components/expenses/ExpenseAnalyticsCard';

function ExpensesScreenContent() {
  const { colors } = useTheme();
  const household = useHouseholdStore(state => state.household);
  const {
    isLoading,
    error,
    loadData,
    expenses,
    categories,
    addExpense,
    deleteExpense,
  } = useExpenseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setCategory] = useState<string | null>(null);

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

  const handleSaveExpense = (
    categoryId: string,
    title: string,
    amount: number,
    paidBy: string,
    date: number,
    notes?: string
  ) => {
    if (household?.id) {
       addExpense(household.id, categoryId, title, amount, currencySymbol, paidBy, date, notes);
    }
    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteExpense(id),
      },
    ]);
  };

  const filteredExpenses = expenses.filter(e => {
    if (searchQuery.trim() && !e.title.toLowerCase().includes(searchQuery.toLowerCase()) && !e.notes?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory && e.categoryId !== selectedCategory) return false;
    return true;
  });

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => { if (household) loadData(household.id) }} /> : (
        <>
          {/* Summary Card */}
          <ExpenseSummaryCard
            totalAmount={totalAmount}
            currencySymbol={currencySymbol}
            selectedMonth={new Date().getMonth().toString()}
            onMonthChange={() => {}}
            onAddPress={handleOpenAdd}
          />

          {/* Analytics Breakdown Card */}
          <ExpenseAnalyticsCard
            expenses={filteredExpenses}
            categories={categories}
            currencySymbol={currencySymbol}
          />

          {/* Search & Header Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Ionicons name="search" size={18} color={colors.outline} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.onSurface }]}
              placeholder="Search expenses..."
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

          {/* Category Horizontal Scroll */}
          <View style={styles.categoryScrollContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                <ExpenseCategoryChip
                  category={null}
                  isSelected={selectedCategory === null}
                  onPress={() => setCategory(null)}
                />
              }
              renderItem={({ item }) => (
                <ExpenseCategoryChip
                  category={item}
                  isSelected={selectedCategory === item.id}
                  onPress={() => setCategory(selectedCategory === item.id ? null : item.id)}
                />
              )}
            />
          </View>

          {/* Expenses Items List */}
          <FlatList
            data={filteredExpenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExpenseItemCard
                expense={item}
                categories={categories}
                onEdit={() => {}} // Disabled edit to match simpler store API
                onDelete={handleDelete}
              />
            )}
            ListEmptyComponent={
              <ExpenseEmptyState
                message="No expenses found matching your criteria."
                onAction={handleOpenAdd}
              />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
          />

          {/* Floating Action Button (FAB) */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
            onPress={handleOpenAdd}
            accessibilityRole="button"
            accessibilityLabel="Add expense"
          >
            <Ionicons name="add" size={28} color={colors.onPrimary} />
          </TouchableOpacity>

        </>
      )}

      {/* Add Expense Modal */}
      <ExpenseItemModal
        visible={isModalVisible}
        categories={categories}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveExpense}
      />
    </View>
  );
}

export default function ExpensesScreen() {
  return <ExpensesScreenContent />;
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
