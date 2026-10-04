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
import { useHouseholdStore } from '../store/useHouseholdStore';
import { Spacing, BorderRadius, Shadows } from '../constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HouseholdMember } from '../types';

export default function FamilyScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Spacing.sm);
  const tabBarHeight = 52 + bottomPadding;
  const household = useHouseholdStore(state => state.household);
  const members = useHouseholdStore(state => state.members);
  const addMember = useHouseholdStore(state => state.addMember);
  const updateMember = useHouseholdStore(state => state.updateMember);
  const removeMember = useHouseholdStore(state => state.removeMember);

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [color, setColor] = useState('#42A5F5');
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);

  const MEMBER_COLORS = ['#42A5F5', '#66BB6A', '#AB47BC', '#FF7043', '#26A69A', '#EC407A', '#FFA726', '#78909C'];

  const handleOpenEdit = (member: HouseholdMember) => {
    setEditingMember(member);
    setName(member.name);
    setWhatsapp(member.whatsapp || '');
    setColor(member.color || '#42A5F5');
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setName('');
    setWhatsapp('');
    setColor('#42A5F5');
  };

  const handleSaveMember = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a member name');
      return;
    }

    if (editingMember) {
      await updateMember(
        editingMember.id,
        name.trim(),
        whatsapp.trim() || undefined,
        color
      );
      Alert.alert('Success', 'Family member updated successfully!');
    } else {
      await addMember(name.trim(), whatsapp.trim() || undefined, color);
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
      contentContainerStyle={[styles.contentContainer, { paddingBottom: tabBarHeight + Spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerCard, { backgroundColor: colors.primaryContainer }]}>
        <Ionicons name="people" size={32} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.onPrimaryContainer }]}>
          {household?.name || 'Household'} Members
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.onPrimaryContainer }]}>
          Manage family members and WhatsApp contacts for task & grocery notifications
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
          placeholder="WhatsApp Number (e.g. +8801712345678)"
          placeholderTextColor={colors.outline}
          keyboardType="phone-pad"
          value={whatsapp}
          onChangeText={setWhatsapp}
        />
        <Text style={[styles.helperText, { color: colors.outline }]}>
          💡 Must include country code (e.g. +880, +1) for WhatsApp notify to work.
        </Text>

        {/* Color Picker */}
        <Text style={[styles.label, { color: colors.onSurfaceVariant, marginTop: Spacing.md }]}>Member Theme Color</Text>
        <View style={styles.colorPickerRow}>
          {MEMBER_COLORS.map((c) => {
            const isSelected = color === c;
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  isSelected && styles.selectedColorCircle,
                ]}
                onPress={() => setColor(c)}
              >
                {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </TouchableOpacity>
            );
          })}
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
            <View style={[styles.avatarBox, { backgroundColor: (member.color || colors.primary) + '20' }]}>
              <Ionicons name="person" size={20} color={member.color || colors.primary} />
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: colors.onSurface }]}>{member.name}</Text>
              <View style={styles.memberMetaRow}>
                {member.whatsapp ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="logo-whatsapp" size={12} color="#25D366" style={{ marginRight: 4 }} />
                    <Text style={[styles.whatsappText, { color: colors.outline }]}>{member.whatsapp}</Text>
                  </View>
                ) : (
                  <Text style={[styles.whatsappText, { color: colors.outline }]}>No WhatsApp saved</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemove(member.id, member.name)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${member.name}`}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
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
    paddingBottom: Spacing.xxxl,
  },
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.md,
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  colorPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorCircle: {
    borderColor: '#FFFFFF',
    ...Shadows.sm,
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
  whatsappText: {
    fontSize: 12,
  },
  helperText: {
    fontSize: 11,
    marginTop: -4,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
