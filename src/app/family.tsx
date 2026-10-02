import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHousehold } from '../context/HouseholdContext';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { HouseholdMember } from '../types';

export default function FamilyScreen() {
  const { colors } = useTheme();
  const { household, members, addMember, updateMember, removeMember } = useHousehold();

  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'child'>('member');
  const [whatsapp, setWhatsapp] = useState('');
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);

  const handleOpenEdit = (member: HouseholdMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setWhatsapp(member.whatsapp || '');
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setName('');
    setRole('member');
    setWhatsapp('');
  };

  const handleSaveMember = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a member name');
      return;
    }

    if (editingMember) {
      await updateMember({
        ...editingMember,
        name: name.trim(),
        role,
        whatsapp: whatsapp.trim() || undefined,
      });
      Alert.alert('Success', 'Family member updated successfully!');
    } else {
      await addMember(name.trim(), role, whatsapp.trim() || undefined);
      Alert.alert('Success', 'Family member added successfully!');
    }

    handleCancelEdit();
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
          Manage family members, roles, and WhatsApp contacts for task notifications
        </Text>
      </View>

      {/* Add / Edit Member Form */}
      <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.formHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            {editingMember ? `Edit Member: ${editingMember.name}` : 'Add Family Member'}
          </Text>
          {editingMember && (
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={[styles.cancelText, { color: colors.error }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surfaceVariant, color: colors.onSurface, borderColor: colors.outline },
          ]}
          placeholder="Member Name (e.g. Sarah)"
          placeholderTextColor={colors.outline}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surfaceVariant, color: colors.onSurface, borderColor: colors.outline },
          ]}
          placeholder="WhatsApp Number (e.g. +8801700000000)"
          placeholderTextColor={colors.outline}
          keyboardType="phone-pad"
          value={whatsapp}
          onChangeText={setWhatsapp}
        />

        <View style={styles.roleContainer}>
          {(['admin', 'member', 'child'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.roleButton,
                {
                  backgroundColor: role === r ? colors.primary : colors.surfaceVariant,
                  borderColor: role === r ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={() => setRole(r)}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  { color: role === r ? '#FFFFFF' : colors.onSurface },
                ]}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveMember}
        >
          <Ionicons name={editingMember ? 'checkmark-circle' : 'person-add'} size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{editingMember ? 'Save Changes' : 'Add Member'}</Text>
        </TouchableOpacity>
      </View>

      {/* Members List */}
      <Text style={[styles.sectionTitle, { color: colors.onBackground, marginTop: Spacing.xl }]}>
        Registered Members ({members.length})
      </Text>

      <View style={styles.memberList}>
        {members.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => handleOpenEdit(member)}
            activeOpacity={0.7}
          >
            <View style={[styles.avatarBox, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: colors.onSurface }]}>{member.name}</Text>
              <View style={styles.memberMetaRow}>
                <Text style={[styles.memberRole, { color: colors.outline }]}>
                  {member.role.toUpperCase()}
                </Text>
                {member.whatsapp && (
                  <>
                    <Text style={[styles.bullet, { color: colors.outline }]}>•</Text>
                    <Ionicons name="logo-whatsapp" size={12} color="#25D366" style={{ marginRight: 2 }} />
                    <Text style={[styles.whatsappText, { color: colors.outline }]}>{member.whatsapp}</Text>
                  </>
                )}
              </View>
            </View>
            {members.length > 1 && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleRemove(member.id, member.name);
                }}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
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
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
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
    color: '#FFFFFF',
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
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberRole: {
    fontSize: 12,
  },
  bullet: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  whatsappText: {
    fontSize: 12,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
