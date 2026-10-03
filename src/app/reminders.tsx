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
import { useReminderStore } from '../store/useReminderStore';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ReminderItemCard } from '../components/reminders/ReminderItemCard';
import { ReminderModal } from '../components/reminders/ReminderModal';
import { ReminderEmptyState } from '../components/reminders/ReminderEmptyState';

function RemindersScreenContent() {
  const { colors } = useTheme();
  const household = useHouseholdStore(state => state.household);
  const {
    loadData,
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
  } = useReminderStore();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);

  React.useEffect(() => {
    if (household?.id) {
      loadData(household.id);
    }
  }, [household?.id, loadData]);

  const handleOpenAdd = () => {
    setIsModalVisible(true);
  };

  const handleSaveReminder = (
    title: string,
    dateTime: number,
    type: 'medicine' | 'general',
    targetMemberId?: string
  ) => {
    if (household?.id) {
       addReminder(household.id, title, dateTime, type, targetMemberId);
    }
    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteReminder(id),
      },
    ]);
  };

  const filteredReminders = reminders.filter(r => {
    if (searchQuery.trim() && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filter === 'pending') return !r.isCompleted;
    if (filter === 'completed') return r.isCompleted;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Bar with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Medicine & Reminders</Text>
          <Text style={[styles.headerSubtitle, { color: colors.outline }]}>
            Medication schedules & general family alerts
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <Ionicons name="search" size={18} color={colors.outline} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder="Search reminders or medications..."
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

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: colors.surfaceVariant }]}>
        {[
          { label: 'All', value: 'all' },
          { label: 'Pending', value: 'pending' },
          { label: 'Completed', value: 'completed' }
        ].map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterTab,
              filter === f.value && { backgroundColor: colors.surface, shadowColor: colors.shadow },
            ]}
            onPress={() => setFilter(f.value as any)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: filter === f.value ? colors.primary : colors.onSurfaceVariant },
                filter === f.value && styles.activeFilterTabText,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Header (Item count) */}
      <View style={styles.actionHeader}>
        <Text style={[styles.itemCountText, { color: colors.outline }]}>
          Showing {filteredReminders.length} of {reminders.length} reminders
        </Text>
      </View>

      {/* Reminders List */}
      <FlatList
        data={filteredReminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderItemCard
            reminder={item}
            onEdit={() => {}} // Disabled editing for now to fit simple store API
            onDelete={handleDelete}
            onToggle={toggleReminder}
          />
        )}
        ListEmptyComponent={<ReminderEmptyState message="No reminders found matching your filters." />}
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

      {/* Add / Edit Reminder Modal */}
      <ReminderModal
        visible={isModalVisible}
        reminderToEdit={null}
        onClose={() => {
          setIsModalVisible(false);
        }}
        onSave={handleSaveReminder}
      />
    </View>
  );
}

export default function RemindersScreen() {
  return <RemindersScreenContent />;
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
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterTabText: {
    fontWeight: '700',
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '500',
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
