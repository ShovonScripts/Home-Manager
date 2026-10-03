import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHouseholdStore } from '../store/useHouseholdStore';
import { useTaskStore } from '../store/useTaskStore';
import { useExpenseStore } from '../store/useExpenseStore';
import { useBillStore } from '../store/useBillStore';
import { useGroceryStore } from '../store/useGroceryStore';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { formatCurrency } from '../utils/currency';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router, useNavigation } from 'expo-router';
import { QuickAddModal } from '../components/common/QuickAddModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../components/common/GlassCard';
import { AmbientBackground } from '../components/common/AmbientBackground';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function DashboardScreen() {
  const { colors, themeMode } = useTheme();
  const household = useHouseholdStore(state => state.household);
  const members = useHouseholdStore(state => state.members);

  const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    const gradientColors = themeMode === 'dark'
      ? (['#8B5CF6', '#6366F1'] as const)
      : (['#620EEA', '#7C3AED'] as const);

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerQuickAddBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsQuickAddVisible(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Quick add item"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerQuickAddGradient}
          >
            <Ionicons name="flash" size={14} color="#FFFFFF" />
            <Text style={styles.headerQuickAddText}>Quick Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors, themeMode]);

  // Pull data and actions from our Zustand stores
  const { tasks, loadTasks } = useTaskStore();
  const { expenses, loadData: loadExpenses } = useExpenseStore();
  const { bills, loadData: loadBills } = useBillStore();
  const { items: groceryItems, loadData: loadGroceries } = useGroceryStore();

  React.useEffect(() => {
    if (household?.id) {
      loadTasks(household.id);
      loadExpenses(household.id);
      loadBills(household.id);
      loadGroceries(household.id);
    }
  }, [household?.id, loadTasks, loadExpenses, loadBills, loadGroceries]);

  // Derived metrics for the dashboard
  const pendingTasksCount = tasks.filter(t => !t.isCompleted).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const unpaidBillsTotal = bills
    .filter(b => !b.isPaid)
    .reduce((sum, b) => sum + b.amount, 0);

  const pendingGroceriesCount = groceryItems.filter(i => !i.isCompleted).length;

  // Urgent alerts calculation
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTime = todayStart.getTime();

  const overdueBills = bills.filter(b => !b.isPaid && b.dueDate < todayTime);
  const dueTodayTasks = tasks.filter(t => !t.isCompleted && t.dueDate && t.dueDate >= todayTime && t.dueDate < todayTime + 86400000);

  // Recent activity stream across all stores
  const recentActivities = [
    ...tasks.map(t => ({ id: t.id, title: t.title, type: 'Task', time: t.createdAt, icon: 'checkbox', color: colors.success, route: '/tasks' })),
    ...expenses.map(e => ({ id: e.id, title: `${e.title} (${formatCurrency(e.amount, household?.currency || '৳')})`, type: 'Expense', time: e.createdAt, icon: 'wallet', color: colors.primary, route: '/expenses' })),
    ...bills.map(b => ({ id: b.id, title: b.title, type: 'Bill', time: b.createdAt, icon: 'receipt', color: colors.error, route: '/bills' })),
    ...groceryItems.map(g => ({ id: g.id, title: g.name, type: 'Grocery', time: g.createdAt, icon: 'basket', color: colors.secondary, route: '/grocery' })),
  ].sort((a, b) => b.time - a.time).slice(0, 4);

  // Dynamic greeting
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 18) greeting = 'Good Afternoon';

  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Spacing.sm);
  const tabBarHeight = 52 + bottomPadding;

  const currencySymbol = household?.currency || '৳';
  const glassBackground =
    themeMode === 'dark' ? 'rgba(30, 32, 35, 0.85)' : 'rgba(255, 255, 255, 0.9)';

  return (
    <AmbientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: tabBarHeight + Spacing.lg }
        ]}
        showsVerticalScrollIndicator={false}
      >
      {/* Urgent Alert Banner (if overdue bills or due today tasks exist) */}
      {(overdueBills.length > 0 || dueTodayTasks.length > 0) && (
        <Animated.View entering={FadeInDown.duration(300).springify()}>
          <TouchableOpacity
            style={[styles.alertBanner, { backgroundColor: colors.errorContainer, borderColor: colors.cardBorder }]}
            onPress={() => {
              if (overdueBills.length > 0) router.push('/bills');
              else router.push('/tasks');
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <View style={styles.alertTextContainer}>
              <Text style={[styles.alertTitle, { color: colors.error }]}>
                Action Required
              </Text>
              <Text style={[styles.alertSubtitle, { color: colors.onSurface }]}>
                {overdueBills.length > 0
                  ? `You have ${overdueBills.length} overdue bill(s) pending payment!`
                  : `You have ${dueTodayTasks.length} task(s) due today.`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.error} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Welcome Banner */}
      <Animated.View entering={FadeInDown.duration(400).springify()}>
        <View
          style={[
            styles.welcomeCard,
            {
              backgroundColor: colors.primaryContainer,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.welcomeTextContainer}>
            <View style={styles.greetingRow}>
              <Ionicons name="sparkles" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.greetingText, { color: colors.onPrimaryContainer }]}>
                {greeting}
              </Text>
            </View>
            <Text style={[styles.householdName, { color: colors.onPrimaryContainer }]}>
              {household?.name || 'Home Manager'}
            </Text>
          </View>
          <AnimatedPressable
            style={[styles.memberBadge, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/family')}
            enableHaptic
          >
            <Ionicons name="people" size={16} color={colors.primary} />
            <Text style={[styles.memberCountText, { color: colors.onSurface }]}>
              {members.length} {members.length === 1 ? 'Member' : 'Members'}
            </Text>
            <Ionicons name="chevron-forward" size={12} color={colors.outline} />
          </AnimatedPressable>
        </View>
      </Animated.View>

      <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
        Household Overview
      </Text>

      {/* Summary Cards Grid */}
      <View style={styles.gridContainer}>
        {/* Spending Card */}
        <GlassCard
          containerStyle={{ width: '48%' }}
          onPress={() => router.push('/expenses')}
          delay={100}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
            <Ionicons name="wallet" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>
            Household Spending
          </Text>
          <Text style={[styles.cardValue, { color: colors.onSurface }]}>
            {formatCurrency(monthlyExpenses, currencySymbol)}
          </Text>
          <Text style={[styles.cardSubtext, { color: colors.outline }]}>This month</Text>
        </GlassCard>

        {/* Grocery Card */}
        <GlassCard
          containerStyle={{ width: '48%' }}
          onPress={() => router.push('/grocery')}
          delay={150}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.secondaryContainer }]}>
            <Ionicons name="basket" size={22} color={colors.secondary} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>Grocery</Text>
          <Text style={[styles.cardValue, { color: colors.onSurface }]}>
            {pendingGroceriesCount} {pendingGroceriesCount === 1 ? 'Item' : 'Items'}
          </Text>
          <Text style={[styles.cardSubtext, { color: colors.outline }]}>Pending to buy</Text>
        </GlassCard>

        {/* Bills Card */}
        <GlassCard
          containerStyle={{ width: '48%' }}
          onPress={() => router.push('/bills')}
          delay={200}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.errorContainer }]}>
            <Ionicons name="receipt" size={22} color={colors.error} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>Bills & Payments</Text>
          <Text style={[styles.cardValue, { color: colors.onSurface }]}>
            {formatCurrency(unpaidBillsTotal, currencySymbol)}
          </Text>
          <Text style={[styles.cardSubtext, { color: colors.outline }]}>
            {bills.filter(b => !b.isPaid).length} unpaid bills
          </Text>
        </GlassCard>

        {/* Tasks Card */}
        <GlassCard
          containerStyle={{ width: '48%' }}
          onPress={() => router.push('/tasks')}
          delay={250}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.successContainer }]}>
            <Ionicons name="checkbox" size={22} color={colors.success} />
          </View>
          <Text style={[styles.cardLabel, { color: colors.onSurfaceVariant }]}>Tasks Today</Text>
          <Text style={[styles.cardValue, { color: colors.onSurface }]}>
            {pendingTasksCount} {pendingTasksCount === 1 ? 'Task' : 'Tasks'}
          </Text>
          <Text style={[styles.cardSubtext, { color: colors.outline }]}>Pending</Text>
        </GlassCard>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.onBackground, marginTop: Spacing.sm }]}>
        Quick Actions
      </Text>

      {/* Quick Actions Row */}
      <Animated.View entering={FadeInDown.duration(400).delay(300).springify()}>
        <TouchableOpacity
          style={[styles.primaryQuickAddBtn, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
          onPress={() => setIsQuickAddVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="flash" size={20} color={colors.onPrimary} />
          <Text style={[styles.primaryQuickAddText, { color: colors.onPrimary }]}>Quick Add Anything</Text>
        </TouchableOpacity>

        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
            onPress={() => router.push('/tasks')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.successContainer }]}>
              <Ionicons name="checkbox-outline" size={18} color={colors.success} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.onSurface }]}>Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
            onPress={() => router.push('/grocery')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.secondaryContainer }]}>
              <Ionicons name="basket-outline" size={18} color={colors.secondary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.onSurface }]}>Grocery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
            onPress={() => router.push('/expenses')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="wallet-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.onSurface }]}>Finance</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Recent Activity Feed */}
      {recentActivities.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.onBackground, marginTop: Spacing.xl }]}>
            Recent Activity
          </Text>
          <Animated.View entering={FadeInDown.duration(400).delay(350).springify()}>
            <View style={[styles.activityCard, { backgroundColor: glassBackground, borderColor: colors.cardBorder }]}>
              {recentActivities.map((act, index) => (
                <TouchableOpacity
                  key={act.id}
                  style={[
                    styles.activityRow,
                    index < recentActivities.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }
                  ]}
                  onPress={() => router.push(act.route as any)}
                >
                  <View style={[styles.activityIconBox, { backgroundColor: act.color + '20' }]}>
                    <Ionicons name={act.icon as any} size={16} color={act.color} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityTitle, { color: colors.onSurface }]} numberOfLines={1}>
                      {act.title}
                    </Text>
                    <Text style={[styles.activityType, { color: colors.outline }]}>
                      {new Date(act.time).toLocaleDateString()} • {act.type}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={colors.outline} />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </>
      )}

      <QuickAddModal
        visible={isQuickAddVisible}
        onClose={() => setIsQuickAddVisible(false)}
      />
    </ScrollView>
  </AmbientBackground>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerQuickAddBtn: {
    marginRight: Spacing.md,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  headerQuickAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 5,
  },
  headerQuickAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 12,
  },
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    ...Shadows.md,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  householdName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: 6,
    ...Shadows.sm,
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
    letterSpacing: 0.2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  card: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.md,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtext: {
    fontSize: 11,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  primaryQuickAddBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 10,
    ...Shadows.md,
  },
  primaryQuickAddText: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  activityIconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityType: {
    fontSize: 11,
  },
});
