import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  groupCode: string;
  groupName: string;
  memberCount: number;
  isLeader: boolean;
  onLeave: () => void;
};

/**
 * HUD superior que muestra la info del grupo activo.
 * Reemplaza al TrackingButton cuando estás en una grupeta.
 */
export default function GroupHUD({
  groupCode,
  groupName,
  memberCount,
  isLeader,
  onLeave,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{groupCode}</Text>
        </View>
        <View>
          <Text style={styles.groupName}>{groupName}</Text>
          <Text style={styles.memberText}>
            {memberCount} ciclista{memberCount !== 1 ? 's' : ''} conectado
            {memberCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.leaveBtn, isLeader ? styles.closeBtnStyle : null]}
        onPress={onLeave}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isLeader ? 'close-circle' : 'exit'}
          size={16}
          color="#fff"
        />
        <Text style={styles.leaveText}>
          {isLeader ? 'Cerrar' : 'Salir'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 55,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20, 20, 28, 0.92)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  codeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  groupName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  memberText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    marginTop: 1,
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  closeBtnStyle: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  leaveText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
});
