import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Radius, Spacing, Shadows } from '../constants/theme';

type Props = {
  groupCode: string;
  groupName: string;
  memberCount: number;
  isLeader: boolean;
  onLeave: () => void;
};

export default function GroupHUD({
  groupCode,
  groupName,
  memberCount,
  isLeader,
  onLeave,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Código con gradiente */}
      <LinearGradient
        colors={Colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.codeBadge}
      >
        <Text style={styles.codeText}>{groupCode}</Text>
      </LinearGradient>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.groupName}>{groupName}</Text>
        <View style={styles.memberRow}>
          <View style={styles.memberDot} />
          <Text style={styles.memberText}>
            {memberCount} conectado{memberCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Botón salir */}
      <TouchableOpacity
        style={[styles.leaveBtn, isLeader && styles.leaderLeaveBtn]}
        onPress={onLeave}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isLeader ? 'close-circle' : 'exit-outline'}
          size={16}
          color={isLeader ? Colors.danger : Colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 58,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  codeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  codeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  info: {
    flex: 1,
  },
  groupName: {
    color: Colors.text,
    ...Typography.headline,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  memberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  memberText: {
    color: Colors.textSecondary,
    ...Typography.caption,
  },
  leaveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderLeaveBtn: {
    backgroundColor: Colors.dangerMuted,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
});
