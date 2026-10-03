import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../constants/theme';

export const BackButton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
      }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
    >
      <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginLeft: Spacing.lg,
    padding: Spacing.xs,
  },
});
