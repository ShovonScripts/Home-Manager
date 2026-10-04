import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
  message?: string;
}

export const ReminderEmptyState: React.FC<Props> = ({ message = 'No reminders found' }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name="notifications-outline" size={56} color={colors.outline} />
      <Text style={[styles.title, { color: colors.onSurface }]}>All Clear</Text>
      <Text style={[styles.subtitle, { color: colors.outline }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
