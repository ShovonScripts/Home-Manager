import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHousehold } from '../context/HouseholdContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ErrorState, LoadingState } from '../components/common/AsyncState';

export default function FamilyScreen() {
  const { colors } = useTheme();
  const { household, members, addMember, removeMember, isLoading, error, refreshHousehold } = useHousehold();
  const [newMemberName, setNewMemberName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member' | 'child'>('member');

  const handleAddMember = async () => {
    if (isAdding) return;
    if (!newMemberName.trim()) {
      Alert.alert('Error', 'Please enter a member name');
      return;
    }
    setIsAdding(true);
    try {
      await addMember(newMemberName.trim(), newMemberRole);
      setNewMemberName('');
      Alert.alert('Success', 'Family member added successfully!');
    } catch {
      // The household error state offers retry; retain the entered member name.
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = (memberId: string, memberName: string) => {
    Alert.alert('Remove Member', `Are you sure you want to remove ${memberName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeMember(memberId),
      },
    ]);
  };

  if (isLoading || error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {isLoading ? <LoadingState /> : <ErrorState message={error!} onRetry={refreshHousehold} />}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.headerCard, { backgroundColor: colors.primaryContainer }]}>
        <Ionicons name="people" size={32} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.onPrimaryContainer }]}>
          {household?.name || 'Household'} Members
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.onPrimaryContainer }]}>
          Manage family members sharing this home
        </Text>
      </View>

      {/* Add Member Form */}
      <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Add Family Member</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surfaceVariant, color: colors.onSurface, borderColor: colors.outline },
          ]}
          placeholder="Member Name (e.g. Sarah)"
          placeholderTextColor={colors.outline}
          value={newMemberName}
          onChangeText={setNewMemberName}
        />

        <View style={styles.roleContainer}>
          {(['admin', 'member', 'child'] as const).map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                {
                  backgroundColor: newMemberRole === role ? colors.primary : colors.surfaceVariant,
                  borderColor: newMemberRole === role ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={() => setNewMemberRole(role)}
              accessibilityRole="radio"
              accessibilityLabel={`${role} role`}
              accessibilityState={{ checked: newMemberRole === role }}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  { color: newMemberRole === role ? colors.onPrimary : colors.onSurface },
                ]}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddMember}
          disabled={isAdding}
          accessibilityRole="button"
          accessibilityLabel="Add family member"
          accessibilityState={{ disabled: isAdding, busy: isAdding }}
        >
          <Ionicons name="person-add" size={18} color={colors.onPrimary} />
          <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>Add Member</Text>
        </TouchableOpacity>
      </View>

      {/* Members List */}
      <Text style={[styles.sectionTitle, { color: colors.onBackground, marginTop: Spacing.xl }]}>
        Registered Members ({members.length})
      </Text>

      <View style={styles.memberList}>
        {members.map((member) => (
          <View
            key={member.id}
            style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <View style={[styles.avatarBox, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: colors.onSurface }]}>{member.name}</Text>
              <Text style={[styles.memberRole, { color: colors.outline }]}>
                Role: {member.role.toUpperCase()}
              </Text>
            </View>
            {members.length > 1 && (
              <TouchableOpacity
                onPress={() => handleRemove(member.id, member.name)}
                style={styles.deleteButton}
                accessibilityRole="button"
                accessibilityLabel={`Remove family member: ${member.name}`}
                hitSlop={8}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}
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
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
    marginBottom: Spacing.md,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  roleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  memberList: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
