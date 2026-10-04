import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHouseholdStore } from '../store/useHouseholdStore';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HouseholdRepository } from '../storage/repositories/householdRepository';
import { Household } from '../types';
import { BackupService } from '../services/backupService';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { colors, themeMode, toggleTheme } = useTheme();
  const household = useHouseholdStore(state => state.household);
  const loadHousehold = useHouseholdStore(state => state.loadHousehold);

  return (
    <SettingsContent
      key={household?.id || 'settings'}
      colors={colors}
      themeMode={themeMode}
      toggleTheme={toggleTheme}
      household={household}
      refreshHousehold={() => loadHousehold()}
    />
  );
}

interface SettingsContentProps {
  colors: any;
  themeMode: string;
  toggleTheme: () => void;
  household: Household | null;
  refreshHousehold: () => Promise<void>;
}

function SettingsContent({
  colors,
  themeMode,
  toggleTheme,
  household,
  refreshHousehold,
}: SettingsContentProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Spacing.sm);
  const tabBarHeight = 52 + bottomPadding;

  const [householdName, setHouseholdName] = useState(household?.name || '');
  const [currency, setCurrency] = useState(household?.currency || '৳');

  const handleSaveHousehold = async () => {
    if (!household || !householdName.trim()) {
      Alert.alert('Error', 'Please enter a valid household name.');
      return;
    }
    try {
      await HouseholdRepository.updateHousehold({
        id: household.id,
        name: householdName.trim(),
        currency,
      });

      Alert.alert('Success', 'Household settings updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update household settings');
    }
  };

  const currencies = [
    { label: 'Bangladeshi Taka (৳)', symbol: '৳' },
    { label: 'US Dollar ($)', symbol: '$' },
    { label: 'Euro (€)', symbol: '€' },
    { label: 'British Pound (£)', symbol: '£' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: tabBarHeight + Spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Household Settings */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>Household Details</Text>

        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Household Name</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surfaceVariant, color: colors.onSurface, borderColor: colors.outline },
          ]}
          value={householdName}
          onChangeText={setHouseholdName}
          placeholder="My Home"
          placeholderTextColor={colors.outline}
        />

        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Currency</Text>
        <View style={styles.currencyRow}>
          {currencies.map((curr) => {
            const isSelected = currency === curr.symbol;
            return (
              <TouchableOpacity
                key={curr.symbol}
                style={[
                  styles.currencyButton,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                  },
                ]}
                onPress={() => setCurrency(curr.symbol)}
              >
                <Text
                  style={[
                    styles.currencyText,
                    { color: isSelected ? colors.onPrimary : colors.onSurface },
                  ]}
                >
                  {curr.symbol}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveHousehold}
        >
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Household Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Appearance Settings */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>Appearance</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name={themeMode === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.primary} />
            <Text style={[styles.labelRow, { color: colors.onSurface }]}>Dark Mode</Text>
          </View>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.outline, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      {/* App Info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>Data Backup & Safety</Text>
        <Text style={[styles.backupDesc, { color: colors.onSurfaceVariant }]}>
          Since all your household records are stored locally on your device for maximum privacy, you can export a secure JSON backup file anytime to save to your cloud drive or share.
        </Text>
        <TouchableOpacity
          style={[styles.backupButton, { backgroundColor: colors.surfaceVariant, borderColor: colors.cardBorder }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            BackupService.exportBackup();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.backupButtonText, { color: colors.primary }]}>Export Database Backup (.JSON)</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>About Home Manager</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.onSurface }]}>Version</Text>
          <Text style={[styles.infoValue, { color: colors.onSurfaceVariant }]}>1.0.0 (Expo SDK 57)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.onSurface }]}>Architecture</Text>
          <Text style={[styles.infoValue, { color: colors.onSurfaceVariant }]}>Offline-First SQLite</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.onSurface }]}>Collaboration</Text>
          <Text style={[styles.infoValue, { color: colors.onSurfaceVariant }]}>WhatsApp Quick-Notify</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
    marginBottom: Spacing.sm,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  currencyButton: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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
  labelRow: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  backupDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  backupButton: {
    flexDirection: 'row',
    height: 46,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...Shadows.sm,
  },
  backupButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
