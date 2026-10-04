import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/theme';

export const LoadingState: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.container} accessibilityState={{ busy: true }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.message, { color: colors.onSurfaceVariant }]} accessibilityLiveRegion="polite">
        Loading...
      </Text>
    </View>
  );
};

interface ErrorStateProps {
  message: string;
  onRetry: () => void | Promise<void>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={32} color={colors.error} accessible={false} />
      <Text
        style={[styles.message, { color: colors.onSurface }]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        {message}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: colors.primary }]}
        onPress={() => void onRetry()}
        accessibilityRole="button"
        accessibilityLabel="Retry loading data"
      >
        <Text style={[styles.retryText, { color: colors.onPrimary }]}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
