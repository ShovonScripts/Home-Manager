import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PdfReportService } from '../services/pdfReportService';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../components/common/GlassCard';
import { AmbientBackground } from '../components/common/AmbientBackground';

export default function FinanceScreen() {
  const { colors } = useTheme();

  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Spacing.sm);
  const tabBarHeight = 52 + bottomPadding;

  return (
    <AmbientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: tabBarHeight + Spacing.lg }]}
      >
      <Text style={[styles.header, { color: colors.onBackground }]}>Financial Hub</Text>

      <View style={styles.grid}>
        <GlassCard
          onPress={() => router.push('/bills')}
          delay={100}
        >
          <View style={[styles.iconWrapper, { backgroundColor: colors.errorContainer }]}>
            <Ionicons name="receipt-outline" size={24} color={colors.error} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Bills & Subscriptions</Text>
          <Text style={[styles.cardDesc, { color: colors.outline }]}>Track upcoming payments and due dates</Text>
        </GlassCard>

        <GlassCard
          onPress={() => router.push('/expenses')}
          delay={200}
        >
          <View style={[styles.iconWrapper, { backgroundColor: colors.primaryContainer }]}>
            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Household Expenses</Text>
          <Text style={[styles.cardDesc, { color: colors.outline }]}>Log shared purchases and groceries</Text>
        </GlassCard>

        <GlassCard
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            PdfReportService.generateMonthlyReport();
          }}
          delay={300}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="document-text-outline" size={24} color="#4F46E5" />
          </View>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Download Monthly PDF Report</Text>
          <Text style={[styles.cardDesc, { color: colors.outline }]}>Export professional financial summary & metrics report</Text>
        </GlassCard>
      </View>
    </ScrollView>
  </AmbientBackground>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.xl,
  },
  grid: {
    gap: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'column',
    ...Shadows.sm,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    fontSize: 14,
  }
});
