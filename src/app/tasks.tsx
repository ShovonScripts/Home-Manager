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
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore, useFilteredTasks } from '../store/useTaskStore';
import { TaskFilterBar } from '../components/tasks/TaskFilterBar';
import { TaskCategoryChip } from '../components/tasks/TaskCategoryChip';
import { TaskItemCard } from '../components/tasks/TaskItemCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskEmptyState } from '../components/tasks/TaskEmptyState';
import { Task } from '../types';

function TasksScreenContent() {
  const { colors } = useTheme();
  const household = useHouseholdStore(state => state.household);
  const {
    tasks,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setCategory,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  } = useTaskStore();

  const filteredTasks = useFilteredTasks();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  let tabBarHeight = 80;

  React.useEffect(() => {
    if (household?.id) {
      loadTasks(household.id);
    }
  }, [household?.id, loadTasks]);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleSaveTask = (
    title: string,
    categoryId: string,
    description?: string,
    assignedTo?: string,
    dueDate?: number
  ) => {
    if (editingTask) {
      updateTask({
        ...editingTask,
        title,
        categoryId,
        description,
        assignedTo,
        dueDate: dueDate !== undefined ? dueDate : editingTask.dueDate,
      });
    } else {
      if (household?.id) {
        addTask(household.id, title, categoryId, description, assignedTo, dueDate);
      }
    }
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTask(id),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <Ionicons name="search" size={18} color={colors.outline} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder="Search tasks, chores, assignees..."
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
      <TaskFilterBar />

      {/* Category Horizontal Scroll */}
      <View style={styles.categoryScrollContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <TaskCategoryChip
              category={null}
              isSelected={selectedCategory === null}
              onPress={() => setCategory(null)}
            />
          }
          renderItem={({ item }) => (
            <TaskCategoryChip
              category={item}
              isSelected={selectedCategory === item.id}
              onPress={() => setCategory(selectedCategory === item.id ? null : item.id)}
            />
          )}
        />
      </View>

      {/* Action Header (Item count) */}
      <View style={styles.actionHeader}>
        <Text style={[styles.itemCountText, { color: colors.outline }]}>
          Showing {filteredTasks.length} of {tasks.length} tasks
        </Text>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItemCard
            task={item}
            categories={categories}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onToggle={toggleTask}
          />
        )}
        ListEmptyComponent={
          <TaskEmptyState
            message="No tasks or chores found matching your filters."
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
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
        onPress={handleOpenAdd}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add / Edit Task Modal */}
      <TaskModal
        visible={isModalVisible}
        taskToEdit={editingTask}
        categories={categories}
        onClose={() => {
          setIsModalVisible(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </View>
  );
}

export default function TasksScreen() {
  return <TasksScreenContent />;
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
