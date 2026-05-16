import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Rider } from '../lib/supabase';
import { getDistanceMeters } from '../lib/groups';
import { Colors, Typography, Radius, Spacing, Shadows } from '../constants/theme';

type Props = {
  riders: Rider[];
  myRiderId: string | null;
  myLocation: { latitude: number; longitude: number } | null;
  groupCode: string | null;
  onGroupPress: () => void;
  onRiderPress: (rider: Rider) => void;
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

/** Punto verde pulsante "en vivo" */
function LiveDot({ color = Colors.success }: { color?: string }) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.liveDotContainer}>
      <Animated.View style={[styles.liveDotOuter, { backgroundColor: color, opacity: pulse }]} />
      <View style={[styles.liveDotInner, { backgroundColor: color }]} />
    </View>
  );
}

export default function BottomPanel({
  riders,
  myRiderId,
  myLocation,
  groupCode,
  onGroupPress,
  onRiderPress,
  stragglerIds,
}: Props) {
  const filteredRiders = groupCode
    ? riders.filter((r) => r.group_code === groupCode)
    : riders;

  return (
    <View style={styles.container}>
      {/* Handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LiveDot color={groupCode ? Colors.primary : Colors.success} />
          <Text style={styles.headerTitle}>
            {groupCode ? 'Tu Grupeta' : 'En Vivo'}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredRiders.length}</Text>
          </View>
        </View>
        {!groupCode && (
          <TouchableOpacity style={styles.groupBtn} onPress={onGroupPress} activeOpacity={0.7}>
            <Ionicons name="people" size={14} color={Colors.primary} />
            <Text style={styles.groupBtnText}>Grupeta</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Empty state */}
      {filteredRiders.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="bicycle-outline" size={36} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyText}>
            {groupCode ? 'Esperando ciclistas...' : 'Sin ciclistas activos'}
          </Text>
          {!groupCode && (
            <TouchableOpacity style={styles.emptyGroupBtn} onPress={onGroupPress} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={16} color={Colors.primary} />
              <Text style={styles.emptyGroupBtnText}>Crear o Unirse</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filteredRiders.map((rider) => {
            const isMe = rider.rider_id === myRiderId;
            const isStraggler = stragglerIds.has(rider.rider_id);
            const accentColor = isMe
              ? Colors.primary
              : isStraggler
              ? Colors.warning
              : Colors.secondary;

            // Distancia
            let distanceStr = '';
            if (!isMe && myLocation) {
              const d = getDistanceMeters(
                myLocation.latitude, myLocation.longitude,
                rider.latitude, rider.longitude
              );
              distanceStr = formatDistance(d);
            }

            return (
              <TouchableOpacity
                key={rider.rider_id}
                style={styles.riderRow}
                onPress={() => onRiderPress(rider)}
                activeOpacity={0.6}
              >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: accentColor }]}>
                  <Ionicons
                    name={isStraggler ? 'warning' : 'bicycle'}
                    size={14}
                    color="#fff"
                  />
                </View>

                {/* Info */}
                <View style={styles.riderInfo}>
                  <Text style={styles.riderName} numberOfLines={1}>
                    {isMe ? 'Tú' : rider.rider_name || rider.rider_id.substring(0, 8)}
                  </Text>
                  <Text
                    style={[
                      styles.riderSubtitle,
                      isStraggler && { color: Colors.warning },
                    ]}
                  >
                    {isStraggler ? '⚠️ Descolgado' : timeAgo(rider.last_updated)}
                  </Text>
                </View>

                {/* Métricas */}
                <View style={styles.metricsCol}>
                  {/* Velocidad */}
                  <View style={styles.metric}>
                    <Text style={[styles.metricValue, { color: accentColor }]}>
                      {rider.speed ? rider.speed.toFixed(0) : '0'}
                    </Text>
                    <Text style={styles.metricUnit}>km/h</Text>
                  </View>

                  {/* Distancia */}
                  {distanceStr ? (
                    <View style={styles.metric}>
                      <Text style={styles.metricValueSmall}>{distanceStr}</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
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
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    maxHeight: '42%',
    borderTopWidth: 1,
    borderColor: Colors.border,
    ...Shadows.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textTertiary,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    color: Colors.text,
    ...Typography.title,
  },
  countBadge: {
    backgroundColor: Colors.bgSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countText: {
    color: Colors.textSecondary,
    ...Typography.caption,
  },
  // Live dot animation
  liveDotContainer: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDotOuter: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  liveDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Group button
  groupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  groupBtnText: {
    color: Colors.primary,
    ...Typography.callout,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    color: Colors.textSecondary,
    ...Typography.body,
  },
  emptyGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    marginTop: Spacing.xs,
  },
  emptyGroupBtnText: {
    color: Colors.primary,
    ...Typography.callout,
  },
  // Rider list
  list: {
    maxHeight: 200,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
    gap: Spacing.md,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    color: Colors.text,
    ...Typography.callout,
    fontSize: 14,
  },
  riderSubtitle: {
    color: Colors.textTertiary,
    ...Typography.caption,
    marginTop: 1,
  },
  // Métricas
  metricsCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricValueSmall: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  metricUnit: {
    color: Colors.textTertiary,
    fontSize: 10,
    fontWeight: '600',
  },
});
