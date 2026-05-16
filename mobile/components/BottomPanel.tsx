import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Rider } from '../lib/supabase';

type Props = {
  riders: Rider[];
  myRiderId: string | null;
};

function timeAgo(isoString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(isoString).getTime()) / 1000
  );
  if (seconds < 5) return 'ahora';
  if (seconds < 60) return `hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `hace ${minutes}min`;
}

/**
 * Panel inferior estilo "Bottom Sheet" que muestra la lista de ciclistas activos.
 * Diseño con glassmorphism, bordes suaves y tipografía limpia.
 */
export default function BottomPanel({ riders, myRiderId }: Props) {
  return (
    <View style={styles.container}>
      {/* Handle / tirón visual */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.liveDot} />
          <Text style={styles.headerTitle}>En Vivo</Text>
        </View>
        <Text style={styles.headerCount}>{riders.length} ciclista{riders.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Lista de ciclistas */}
      {riders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bicycle-outline" size={32} color="#555" />
          <Text style={styles.emptyText}>No hay ciclistas activos</Text>
          <Text style={styles.emptySubtext}>¡Sé el primero en compartir tu ruta!</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {riders.map((rider) => {
            const isMe = rider.rider_id === myRiderId;
            return (
              <View key={rider.rider_id} style={styles.riderRow}>
                <View style={[styles.riderIcon, isMe ? styles.riderIconMe : styles.riderIconOther]}>
                  <Ionicons name="bicycle" size={14} color="#fff" />
                </View>
                <View style={styles.riderInfo}>
                  <Text style={styles.riderName}>
                    {isMe ? '📍 Tú' : `Ciclista ${rider.rider_id.substring(0, 8)}`}
                  </Text>
                  <Text style={styles.riderTime}>{timeAgo(rider.last_updated)}</Text>
                </View>
                <View style={[styles.statusBadge, isMe ? styles.badgeMe : styles.badgeOther]}>
                  <Text style={styles.statusText}>{isMe ? 'Emitiendo' : 'Activo'}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20, 20, 28, 0.92)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '40%',
    // Sombra hacia arriba
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399', // Verde vibrante
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '500',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
  },
  // Rider list
  list: {
    maxHeight: 180,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  riderIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderIconMe: {
    backgroundColor: '#FF6B35',
  },
  riderIconOther: {
    backgroundColor: '#6C63FF',
  },
  riderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  riderName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  riderTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeMe: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  badgeOther: {
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
});
