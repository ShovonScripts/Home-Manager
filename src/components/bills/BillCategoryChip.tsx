import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BillCategory } from '../../constants/billCategories';

interface Props {
  category: BillCategory | null; // null means 'All'
  isSelected: boolean;
  onPress: () => void;
}

export const BillCategoryChip: React.FC<Props> = ({ category, isSelected, onPress }) => {
  const { colors } = useTheme();

  const name = category ? category.name : 'All Categories';
  const icon = category ? category.icon : 'apps-outline';
  const color = category ? category.color : colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderColor: isSelected ? colors.primary : colors.cardBorder,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon as any}
        size={14}
        color={isSelected ? colors.onPrimary : color}
        style={{ marginRight: 6 }}
      />
      <Text
        style={[
          styles.chipText,
          { color: isSelected ? colors.onPrimary : colors.onSurface },
        ]}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.sm,
    height: 36,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
