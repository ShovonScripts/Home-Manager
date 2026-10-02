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
import { ExpenseProvider, useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { useHousehold } from '../context/HouseholdContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseSummaryCard } from '../components/expenses/ExpenseSummaryCard';
import { ExpenseCategoryChip } from '../components/expenses/ExpenseCategoryChip';
import { ExpenseItemCard } from '../components/expenses/ExpenseItemCard';
import { ExpenseItemModal } from '../components/expenses/ExpenseItemModal';
import { ExpenseEmptyState } from '../components/expenses/ExpenseEmptyState';
import { Expense } from '../types';

function ExpensesScreenContent() {
  const { colors } = useTheme();
  const { household } = useHousehold();
  const {
    expenses,
    filteredExpenses,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setCategory,
    selectedMonth,
    setMonthFilter,
    totalAmount,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpense();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const currencySymbol = household?.currency || '৳';

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsModalVisible(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
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
    if (editingExpense) {
      updateExpense({
        ...editingExpense,
        categoryId,
        title,
        amount,
        paidBy,
        date,
        notes,
      });
    } else {
      addExpense(categoryId, title, amount, paidBy, date, notes, currencySymbol);
    }
    setEditingExpense(null);
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Summary Card */}
      <ExpenseSummaryCard
        totalAmount={totalAmount}
        currencySymbol={currencySymbol}
        selectedMonth={selectedMonth}
        onMonthChange={setMonthFilter}
        onAddPress={handleOpenAdd}
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
          <TouchableOpacity onPress={() => setSearchQuery('')}>
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
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={<ExpenseEmptyState message="No expenses found matching your criteria." />}
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
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add / Edit Expense Modal */}
      <ExpenseItemModal
        visible={isModalVisible}
        expenseToEdit={editingExpense}
        categories={categories}
        onClose={() => {
          setIsModalVisible(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
      />
    </View>
  );
}

export default function ExpensesScreen() {
  return (
    <ExpenseProvider>
      <ExpensesScreenContent />
    </ExpenseProvider>
  );
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
