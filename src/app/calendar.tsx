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
import { useCalendarStore } from '../store/useCalendarStore';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CalendarCategoryChip } from '../components/calendar/CalendarCategoryChip';
import { CalendarItemCard } from '../components/calendar/CalendarItemCard';
import { CalendarModal } from '../components/calendar/CalendarModal';
import { CalendarEmptyState } from '../components/calendar/CalendarEmptyState';
import { CALENDAR_CATEGORIES } from '../constants/calendarCategories';

function CalendarScreenContent() {
  const { colors } = useTheme();
  const household = useHouseholdStore(state => state.household);
  const {
    loadData,
    events,
    addEvent,
    deleteEvent,
  } = useCalendarStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);

  React.useEffect(() => {
    if (household?.id) {
      loadData(household.id);
    }
  }, [household?.id, loadData]);

  const handleOpenAdd = () => {
    setIsModalVisible(true);
  };

  const handleSaveDate = (
    title: string,
    date: number,
    category: 'birthday' | 'anniversary' | 'event',
    isRecurringYearly: boolean
  ) => {
    if (household?.id) {
       addEvent(household.id, title, date, isRecurringYearly, category);
    }
    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteEvent(id),
      },
    ]);
  };

  const filteredDates = events.filter(e => {
    if (searchQuery.trim() && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory && e.category !== selectedCategory) return false;
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
          <Text style={[styles.headerTitle, { color: colors.onBackground }]}>Important Dates & Events</Text>
          <Text style={[styles.headerSubtitle, { color: colors.outline }]}>
            Birthdays, anniversaries & household milestones
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <Ionicons name="search" size={18} color={colors.outline} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder="Search birthdays, events..."
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
          data={CALENDAR_CATEGORIES}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <CalendarCategoryChip
              category={null}
              isSelected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
            />
          }
          renderItem={({ item }) => (
            <CalendarCategoryChip
              category={item}
              isSelected={selectedCategory === item.name}
              onPress={() => setSelectedCategory(selectedCategory === item.name ? null : item.name)}
            />
          )}
        />
      </View>

      {/* Action Header (Item count) */}
      <View style={styles.actionHeader}>
        <Text style={[styles.itemCountText, { color: colors.outline }]}>
          Showing {filteredDates.length} of {events.length} events
        </Text>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredDates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CalendarItemCard
            item={item}
            onEdit={() => {}} // Edit temporarily disabled
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={<CalendarEmptyState message="No important dates found matching your filters." />}
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

      {/* Add / Edit Event Modal */}
      <CalendarModal
        visible={isModalVisible}
        itemToEdit={null}
        onClose={() => {
          setIsModalVisible(false);
        }}
        onSave={handleSaveDate}
      />
    </View>
  );
}

export default function CalendarScreen() {
  return <CalendarScreenContent />;
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
