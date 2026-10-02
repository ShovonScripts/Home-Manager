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
import { BillProvider, useBill, BillStatusFilter } from '../context/BillContext';
import { useTheme } from '../context/ThemeContext';
import { useHousehold } from '../context/HouseholdContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BillSummaryCard } from '../components/bills/BillSummaryCard';
import { BillCategoryChip } from '../components/bills/BillCategoryChip';
import { BillItemCard } from '../components/bills/BillItemCard';
import { BillModal } from '../components/bills/BillModal';
import { BillEmptyState } from '../components/bills/BillEmptyState';
import { BILL_CATEGORIES } from '../constants/billCategories';
import { Bill } from '../types';

function BillsScreenContent() {
  const { colors } = useTheme();
  const { household } = useHousehold();
  const {
    bills,
    filteredBills,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    totalOutstanding,
    totalPaid,
    totalOverdue,
    addBill,
    updateBill,
    deleteBill,
    togglePaid,
  } = useBill();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const currencySymbol = household?.currency || '৳';

  const handleOpenAdd = () => {
    setEditingBill(null);
    setIsModalVisible(true);
  };

  const handleOpenEdit = (bill: Bill) => {
    setEditingBill(bill);
    setIsModalVisible(true);
  };

  const handleSaveBill = (
    title: string,
    amount: number,
    dueDate: number,
    category: string,
    notes?: string
  ) => {
    if (editingBill) {
      updateBill({
        ...editingBill,
        title,
        amount,
        dueDate,
        category,
        notes,
      });
    } else {
      addBill(title, amount, dueDate, category, notes, 'monthly', currencySymbol);
    }
    setEditingBill(null);
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

  const statusFilters: { label: string; value: BillStatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Bar with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Bills & Payments</Text>
          <Text style={[styles.headerSubtitle, { color: colors.outline }]}>
            Track utility bills, rent, and recurring payments
          </Text>
        </View>
      </View>

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
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.outline} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter Tabs */}
      <View style={[styles.statusFilterBar, { backgroundColor: colors.surfaceVariant }]}>
        {statusFilters.map((f) => {
          const isActive = selectedStatus === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.statusTab,
                isActive && { backgroundColor: colors.surface, shadowColor: colors.shadow },
              ]}
              onPress={() => setSelectedStatus(f.value)}
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
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onTogglePaid={(id, isPaid) => togglePaid(id, isPaid)}
          />
        )}
        ListEmptyComponent={<BillEmptyState message="No bills found matching your filters." />}
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

      {/* Add / Edit Bill Modal */}
      <BillModal
        visible={isModalVisible}
        billToEdit={editingBill}
        onClose={() => {
          setIsModalVisible(false);
          setEditingBill(null);
        }}
        onSave={handleSaveBill}
      />
    </View>
  );
}

export default function BillsScreen() {
  return (
    <BillProvider>
      <BillsScreenContent />
    </BillProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: 4,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
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
