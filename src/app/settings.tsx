import React from 'react';
import { StyleSheet, Text, View, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHousehold } from '../context/HouseholdContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ErrorState, LoadingState } from '../components/common/AsyncState';

export default function SettingsScreen() {
  const { colors, themeMode, toggleTheme } = useTheme();
  const { household, members, isLoading, error, refreshHousehold } = useHousehold();

  if (isLoading || error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {isLoading ? <LoadingState /> : <ErrorState message={error!} onRetry={refreshHousehold} />}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Household Info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>Household Details</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.onSurface }]}>Household Name</Text>
          <Text style={[styles.value, { color: colors.onSurfaceVariant }]}>{household?.name || 'My Home'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.onSurface }]}>Currency</Text>
          <Text style={[styles.value, { color: colors.onSurfaceVariant }]}>{household?.currency || '৳'} (BDT)</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.onSurface }]}>Members</Text>
          <Text style={[styles.value, { color: colors.onSurfaceVariant }]}>{members.length} registered</Text>
        </View>
      </View>

      {/* Appearance Settings */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>Appearance</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name={themeMode === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.primary} />
            <Text style={[styles.label, { color: colors.onSurface, marginLeft: Spacing.md }]}>Dark Mode</Text>
          </View>
          <Switch
            accessibilityRole="switch"
            accessibilityLabel="Dark mode"
            accessibilityState={{ checked: themeMode === 'dark' }}
            value={themeMode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.outline, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      {/* App Info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>About Home Manager</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.onSurface }]}>Version</Text>
          <Text style={[styles.value, { color: colors.onSurfaceVariant }]}>1.0.0 (Expo SDK 57)</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.onSurface }]}>Architecture</Text>
          <Text style={[styles.value, { color: colors.onSurfaceVariant }]}>Offline-First SQLite</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
  },
});
