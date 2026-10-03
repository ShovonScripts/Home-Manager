import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../components/common/GlassCard';

export default function HelpScreen() {
  const { colors } = useTheme();

  const guides = [
    {
      title: '1. Managing Family & Colors',
      desc: 'Go to the Family tab to add your household members. Assign each person a custom theme color. When you assign tasks or groceries to them, their name badge and icon will automatically tint to their personal color!',
      icon: 'people-outline',
      color: '#42A5F5',
    },
    {
      title: '2. The "Quick Add Anything" Button',
      desc: 'On the Home dashboard, tap the primary Quick Add button to open a unified menu. You can instantly create tasks, grocery items, expenses, bills, or reminders in seconds without jumping between tabs.',
      icon: 'flash-outline',
      color: '#FFB74D',
    },
    {
      title: '3. WhatsApp Quick-Notify',
      desc: 'When assigning a task or grocery item to a family member who has a saved WhatsApp number (with country code like +880 or +1), a green WhatsApp "Notify" button will appear. Tap it to instantly message them on WhatsApp with a pre-filled reminder!',
      icon: 'logo-whatsapp',
      color: '#25D366',
    },
    {
      title: '4. Finance & Monthly PDF Reports',
      desc: 'Track household spending and bills in the Finance hub. You can view real-time category breakdown progress bars and tap "Download Monthly PDF Report" to export a professional summary document.',
      icon: 'document-text-outline',
      color: '#4F46E5',
    },
    {
      title: '5. Offline Safety & JSON Backups',
      desc: 'Your data is 100% private and stored locally on your device using SQLite. Go to Settings anytime to export a full .json database backup so you never risk losing your family records.',
      icon: 'shield-checkmark-outline',
      color: '#66BB6A',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.introCard, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="book-outline" size={32} color={colors.primary} />
          <Text style={[styles.introTitle, { color: colors.onPrimaryContainer }]}>User Guide & Tutorials</Text>
          <Text style={[styles.introText, { color: colors.onPrimaryContainer }]}>
            Welcome to Home Manager! Here is a quick walkthrough to help you and your family get the most out of your offline-first household hub.
          </Text>
        </View>

        <View style={styles.guidesList}>
          {guides.map((g, index) => (
            <GlassCard key={index} delay={index * 60}>
              <View style={styles.guideHeader}>
                <View style={[styles.iconBox, { backgroundColor: g.color + '20' }]}>
                  <Ionicons name={g.icon as any} size={20} color={g.color} />
                </View>
                <Text style={[styles.guideTitle, { color: colors.onSurface }]}>{g.title}</Text>
              </View>
              <Text style={[styles.guideDesc, { color: colors.onSurfaceVariant }]}>{g.desc}</Text>
            </GlassCard>
          ))}
        </View>
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
  introCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  introText: {
    fontSize: 13,
    lineHeight: 20,
  },
  guidesList: {
    gap: Spacing.md,
  },
  guideCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  guideDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
});
