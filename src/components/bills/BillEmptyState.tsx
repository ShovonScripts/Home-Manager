import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export const BillEmptyState: React.FC<Props> = ({ message = 'No bills found', onAction, actionLabel = 'Add New Bill' }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: colors.errorContainer }]}>
        <Ionicons name="receipt-outline" size={32} color={colors.error} />
      </View>
      <Text style={[styles.title, { color: colors.onSurface }]}>All Bills Clear</Text>
      <Text style={[styles.subtitle, { color: colors.outline }]}>{message}</Text>
      {onAction && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={colors.onPrimary} />
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    gap: 6,
    ...Shadows.md,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
