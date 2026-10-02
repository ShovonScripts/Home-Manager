import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TaskFilter, useTask } from '../../context/TaskContext';
import { Spacing, BorderRadius } from '../../constants/theme';

export const TaskFilterBar: React.FC = () => {
  const { colors } = useTheme();
  const { filter, setFilter } = useTask();

  const filters: { label: string; value: TaskFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Today', value: 'today' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
      {filters.map((f) => {
        const isActive = filter === f.value;
        return (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.tab,
              isActive && { backgroundColor: colors.surface, shadowColor: colors.shadow },
            ]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[
                styles.tabText,
                { color: isActive ? colors.primary : colors.onSurfaceVariant },
                isActive && styles.activeTabText,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
});
