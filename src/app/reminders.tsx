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
import { ReminderProvider, useReminder } from '../context/ReminderContext';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ReminderFilterBar } from '../components/reminders/ReminderFilterBar';
import { ReminderItemCard } from '../components/reminders/ReminderItemCard';
import { ReminderModal } from '../components/reminders/ReminderModal';
import { ReminderEmptyState } from '../components/reminders/ReminderEmptyState';
import { Reminder } from '../types';

function RemindersScreenContent() {
  const { colors } = useTheme();
  const {
    reminders,
    filteredReminders,
    searchQuery,
    setSearchQuery,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
  } = useReminder();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const handleOpenAdd = () => {
    setEditingReminder(null);
    setIsModalVisible(true);
  };

  const handleOpenEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsModalVisible(true);
  };

  const handleSaveReminder = (
    title: string,
    dateTime: number,
    type: 'medicine' | 'general',
    targetMemberId?: string
  ) => {
    if (editingReminder) {
      updateReminder({
        ...editingReminder,
        title,
        dateTime,
        type,
        targetMemberId,
      });
    } else {
      addReminder(title, dateTime, type, targetMemberId);
    }
    setEditingReminder(null);
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
      <ReminderFilterBar />

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
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onToggle={(id, isCompleted) => toggleReminder(id, isCompleted)}
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
        key={editingReminder?.id || 'new-reminder'}
        visible={isModalVisible}
        reminderToEdit={editingReminder}
        onClose={() => {
          setIsModalVisible(false);
          setEditingReminder(null);
        }}
        onSave={handleSaveReminder}
      />
    </View>
  );
}

export default function RemindersScreen() {
  return (
    <ReminderProvider>
      <RemindersScreenContent />
    </ReminderProvider>
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
