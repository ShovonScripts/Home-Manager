import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GROCERY_CATEGORIES } from '../../constants/groceryCategories';

interface Props {
  categoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

export const GroceryCategoryChipList: React.FC<Props> = ({ categoryId, onSelect }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: categoryId === null ? colors.primary : colors.surface,
          borderColor: categoryId === null ? colors.primary : colors.cardBorder,
        },
      ]}
      onPress={() => onSelect(null)}
    >
      <Text
        style={[
          styles.chipText,
          { color: categoryId === null ? colors.onPrimary : colors.onSurface },
        ]}
      >
        All Categories
      </Text>
    </TouchableOpacity>
  );
};

interface SingleChipProps {
  categoryName: string;
  isSelected: boolean;
  onPress: () => void;
}

export const GroceryCategoryChip: React.FC<SingleChipProps> = ({
  categoryName,
  isSelected,
  onPress,
}) => {
  const { colors } = useTheme();
  const catObj = GROCERY_CATEGORIES.find((c) => c.name === categoryName);

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
      accessibilityRole="button"
      accessibilityLabel={categoryName}
      accessibilityState={{ selected: isSelected }}
    >
      {catObj && (
        <Ionicons
          name={catObj.icon as any}
          size={14}
          color={isSelected ? colors.onPrimary : catObj.color}
          style={{ marginRight: 6 }}
        />
      )}
      <Text
        style={[
          styles.chipText,
          { color: isSelected ? colors.onPrimary : colors.onSurface },
        ]}
      >
        {categoryName}
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
