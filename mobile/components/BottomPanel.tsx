import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Rider } from '../lib/supabase';
import { getDistanceMeters } from '../lib/groups';

type Props = {
  riders: Rider[];
  myRiderId: string | null;
  myLocation: { latitude: number; longitude: number } | null;
  groupCode: string | null;
  onGroupPress: () => void;
  stragglerIds: Set<string>;
};

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

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
 * Panel inferior con lista de ciclistas.
 * Si estás en un grupo, filtra solo los de tu grupo.
 * Muestra botón de "Grupeta" si no estás en ningún grupo.
 */
export default function BottomPanel({
  riders,
  myRiderId,
  myLocation,
  groupCode,
  onGroupPress,
  stragglerIds,
}: Props) {
  // Si estamos en un grupo, filtramos solo los del grupo
  const filteredRiders = groupCode
    ? riders.filter((r) => r.group_code === groupCode)
    : riders;

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.liveDot, groupCode ? styles.liveDotGroup : null]} />
          <Text style={styles.headerTitle}>
            {groupCode ? 'Tu Grupeta' : 'En Vivo'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerCount}>
            {filteredRiders.length} ciclista{filteredRiders.length !== 1 ? 's' : ''}
          </Text>
          {!groupCode && (
            <TouchableOpacity style={styles.groupBtn} onPress={onGroupPress}>
              <Ionicons name="people" size={16} color="#FF6B35" />
              <Text style={styles.groupBtnText}>Grupeta</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista */}
      {filteredRiders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bicycle-outline" size={32} color="#555" />
          <Text style={styles.emptyText}>
            {groupCode
              ? 'Esperando ciclistas en tu grupeta...'
              : 'No hay ciclistas activos'}
          </Text>
          {!groupCode && (
            <TouchableOpacity style={styles.emptyGroupBtn} onPress={onGroupPress}>
              <Text style={styles.emptyGroupBtnText}>Crear o Unirse a una Grupeta</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filteredRiders.map((rider) => {
            const isMe = rider.rider_id === myRiderId;
            const isStraggler = stragglerIds.has(rider.rider_id);
            return (
              <View key={rider.rider_id} style={styles.riderRow}>
                <View
                  style={[
                    styles.riderIcon,
                    isMe
                      ? styles.riderIconMe
                      : isStraggler
                      ? styles.riderIconStraggler
                      : styles.riderIconOther,
                  ]}
                >
                  <Ionicons
                    name={isStraggler ? 'warning' : 'bicycle'}
                    size={14}
                    color="#fff"
                  />
                </View>
                <View style={styles.riderInfo}>
                  <Text style={styles.riderName}>
                    {isMe ? '📍 Tú' : rider.rider_name || `Ciclista ${rider.rider_id.substring(0, 8)}`}
                  </Text>
                  <Text
                    style={[
                      styles.riderTime,
                      isStraggler ? styles.riderTimeStraggler : null,
                    ]}
                  >
                    {isStraggler
                      ? '⚠️ Descolgado del grupo'
                      : timeAgo(rider.last_updated)}
                  </Text>
                </View>
                {/* Métricas: velocidad y distancia */}
                <View style={styles.metricsContainer}>
                  <View style={styles.metricBadge}>
                    <Ionicons name="speedometer-outline" size={10} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.metricText}>
                      {rider.speed ? `${rider.speed.toFixed(0)}` : '0'}
                    </Text>
                    <Text style={styles.metricUnit}>km/h</Text>
                  </View>
                  {!isMe && myLocation && (
                    <View style={styles.metricBadge}>
                      <Ionicons name="locate-outline" size={10} color="rgba(255,255,255,0.5)" />
                      <Text style={styles.metricText}>
                        {formatDistance(
                          getDistanceMeters(
                            myLocation.latitude,
                            myLocation.longitude,
                            rider.latitude,
                            rider.longitude
                          )
                        )}
                      </Text>
                    </View>
                  )}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  liveDotGroup: {
    backgroundColor: '#FF6B35',
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
  groupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  groupBtnText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: '700',
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
    textAlign: 'center',
  },
  emptyGroupBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyGroupBtnText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '700',
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
  riderIconMe: { backgroundColor: '#FF6B35' },
  riderIconOther: { backgroundColor: '#6C63FF' },
  riderIconStraggler: { backgroundColor: '#FBBF24' },
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
  riderTimeStraggler: {
    color: '#FBBF24',
  },
  // Métricas (velocidad + distancia)
  metricsContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metricText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
  },
  metricUnit: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '500',
  },
});
