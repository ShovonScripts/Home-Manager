import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../components/common/GlassCard';

export default function AboutScreen() {
  const { colors } = useTheme();

  const handleOpenLink = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* App Identity */}
        <View style={styles.identitySection}>
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.primaryContainer }]}>
            <Ionicons name="home" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.onBackground }]}>Home Manager</Text>
          <Text style={[styles.appVersion, { color: colors.outline }]}>Version 1.0.0</Text>
        </View>

        {/* Developer Credit */}
        <GlassCard containerStyle={{ marginBottom: Spacing.md }} delay={100}>
          <View style={styles.cardHeader}>
            <Ionicons name="code-slash" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Developer Credit</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.onSurfaceVariant }]}>
            Designed and developed with passion by <Text style={{ fontWeight: '700', color: colors.primary, textDecorationLine: 'underline' }} onPress={() => handleOpenLink('https://www.facebook.com/shovon.5271')}>Shovon</Text>. This project was created to help families and individuals manage their households efficiently without compromising on design or user experience.
          </Text>
        </GlassCard>

        {/* Security & Privacy */}
        <GlassCard containerStyle={{ marginBottom: Spacing.md }} delay={200}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>100% Safe & Private</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.onSurfaceVariant }]}>
            Your data belongs to you. Home Manager is built on an <Text style={{ fontWeight: '700', color: colors.onSurface }}>Offline-First Architecture</Text>. All of your household tasks, groceries, and financial records are securely encrypted and stored locally on your device using SQLite. No cloud tracking, no hidden analytics, and no mandatory internet connection required.
          </Text>
        </GlassCard>

        {/* Support the Developer */}
        <GlassCard containerStyle={{ marginBottom: Spacing.md }} delay={300}>
          <View style={styles.cardHeader}>
            <Ionicons name="cafe" size={20} color="#FF813F" />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Support My Work</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.onSurfaceVariant, marginBottom: Spacing.lg }]}>
            If this app has helped you organize your home and { "you'd" } like to support the ongoing development, maintenance, and future updates, consider buying me a coffee!
          </Text>

          <TouchableOpacity
            style={[styles.coffeeButton, { backgroundColor: '#FFDD00' }]}
            onPress={() => handleOpenLink('https://buymeacoffee.com/mr.nas')}
            activeOpacity={0.8}
          >
            <Ionicons name="cafe" size={20} color="#000000" />
            <Text style={styles.coffeeButtonText}>Buy me a coffee</Text>
          </TouchableOpacity>
        </GlassCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    ...Shadows.sm,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  identitySection: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  coffeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.round,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  coffeeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
