import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import MapView from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '../../lib/supabase';
import type { Rider, GroupAlert, GroupSession } from '../../lib/supabase';
import {
  startTracking,
  stopTracking,
  getRiderId,
  setRiderName,
  setCurrentGroup,
} from '../../lib/location';
import {
  createGroup,
  joinGroup,
  leaveGroup,
  closeGroup,
  sendGroupAlert,
  getDistanceMeters,
} from '../../lib/groups';

import RiderMarker from '../../components/RiderMarker';
import BottomPanel from '../../components/BottomPanel';
import TrackingButton from '../../components/TrackingButton';
import GroupModal from '../../components/GroupModal';
import GroupHUD from '../../components/GroupHUD';
import AlertBanner from '../../components/AlertBanner';

// ─── Constantes ────────────────────────────────────────
const STRAGGLER_DISTANCE_METERS = 200; // Distancia para considerar a alguien descolgado
const STRAGGLER_CHECK_INTERVAL = 10000; // Cada 10 segundos

// Estilo oscuro premium para Google Maps
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d2b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d2b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a9a' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2a2a3c' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#252536' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6a6a7a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2c2c40' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1b1b2a' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3a3a52' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#252536' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e0e1a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d3d5c' }],
  },
];

export default function MapScreen() {
  const [riders, setRiders] = useState<Record<string, Rider>>({});
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [myRiderId, setMyRiderId] = useState<string | null>(null);

  // Grupo
  const [groupCode, setGroupCode] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('Grupeta');
  const [isLeader, setIsLeader] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Alertas
  const [latestAlert, setLatestAlert] = useState<GroupAlert | null>(null);
  const [stragglerIds, setStragglerIds] = useState<Set<string>>(new Set());

  const mapRef = useRef<MapView>(null);
  const ridersRef = useRef(riders);
  ridersRef.current = riders;

  // ─── Suscripción Realtime a riders ──────────────────────────────
  useEffect(() => {
    const fetchInitial = async () => {
      const { data, error } = await supabase.from('active_riders').select('*');
      if (!error && data) {
        const map: Record<string, Rider> = {};
        data.forEach((r: Rider) => { map[r.rider_id] = r; });
        setRiders(map);
      }
    };
    fetchInitial();

    const channel = supabase
      .channel('realtime:active_riders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_riders' },
        (payload) => {
          const { eventType, new: newRec, old: oldRec } = payload;
          setRiders((prev) => {
            const updated = { ...prev };
            if (eventType === 'INSERT' || eventType === 'UPDATE') {
              updated[(newRec as Rider).rider_id] = newRec as Rider;
            } else if (eventType === 'DELETE') {
              const deletedId = (oldRec as Rider).rider_id;
              // Si alguien de nuestro grupo se desconecta, alertar
              if (
                groupCode &&
                prev[deletedId]?.group_code === groupCode &&
                deletedId !== getRiderId()
              ) {
                const name = prev[deletedId]?.rider_name || deletedId.substring(0, 8);
                sendGroupAlert(
                  groupCode,
                  'disconnected',
                  getRiderId(),
                  `${name} se ha desconectado`,
                  deletedId
                );
              }
              delete updated[deletedId];
            }
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupCode]);

  // ─── Suscripción Realtime a alertas del grupo ───────────────────
  useEffect(() => {
    if (!groupCode) return;

    const alertChannel = supabase
      .channel(`realtime:group_alerts:${groupCode}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_alerts',
          filter: `group_code=eq.${groupCode}`,
        },
        (payload) => {
          const newAlert = payload.new as GroupAlert;
          setLatestAlert(newAlert);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertChannel);
    };
  }, [groupCode]);

  // ─── Detección de descolgados (cada 10s) ────────────────────────
  useEffect(() => {
    if (!groupCode || !myRiderId) return;

    const interval = setInterval(() => {
      const currentRiders = ridersRef.current;
      const groupRiders = Object.values(currentRiders).filter(
        (r) => r.group_code === groupCode
      );

      if (groupRiders.length < 2) return;

      // Calcular el centroide del grupo
      const avgLat =
        groupRiders.reduce((sum, r) => sum + r.latitude, 0) / groupRiders.length;
      const avgLon =
        groupRiders.reduce((sum, r) => sum + r.longitude, 0) / groupRiders.length;

      const newStragglers = new Set<string>();

      groupRiders.forEach((rider) => {
        const distance = getDistanceMeters(
          rider.latitude,
          rider.longitude,
          avgLat,
          avgLon
        );
        if (distance > STRAGGLER_DISTANCE_METERS) {
          newStragglers.add(rider.rider_id);
        }
      });

      // Solo enviar alerta si hay nuevos descolgados que antes no lo estaban
      setStragglerIds((prev) => {
        newStragglers.forEach((id) => {
          if (!prev.has(id) && id !== myRiderId) {
            const name =
              currentRiders[id]?.rider_name || id.substring(0, 8);
            const dist = Math.round(
              getDistanceMeters(
                currentRiders[id].latitude,
                currentRiders[id].longitude,
                avgLat,
                avgLon
              )
            );
            sendGroupAlert(
              groupCode,
              'straggler',
              getRiderId(),
              `${name} está a ${dist}m del grupo`,
              id
            );
          }
        });
        return newStragglers;
      });
    }, STRAGGLER_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [groupCode, myRiderId]);

  // ─── Handlers ───────────────────────────────────────────────────
  const handleTrackingPress = useCallback(async () => {
    if (isTracking) {
      if (groupCode) {
        if (isLeader) {
          await closeGroup(groupCode);
        } else {
          await leaveGroup(getRiderId());
        }
        setGroupCode(null);
        setIsLeader(false);
      }
      await stopTracking();
      setIsTracking(false);
      setMyRiderId(null);
      return;
    }

    setIsLoading(true);
    try {
      const riderId = await startTracking(
        (lat, lon) => {
          mapRef.current?.animateToRegion(
            { latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 },
            800
          );
        },
        (msg) => Alert.alert('Error de Ubicación', msg)
      );
      setMyRiderId(riderId);
      setIsTracking(true);
    } catch {
      // Permisos denegados
    } finally {
      setIsLoading(false);
    }
  }, [isTracking, groupCode, isLeader]);

  const handleCreateGroup = useCallback(
    async (name: string) => {
      if (!isTracking) {
        // Auto-iniciar tracking al crear grupo
        setIsLoading(true);
        try {
          setRiderName(name);
          const riderId = await startTracking(
            (lat, lon) => {
              mapRef.current?.animateToRegion(
                { latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 },
                800
              );
            },
            (msg) => Alert.alert('Error de Ubicación', msg)
          );
          setMyRiderId(riderId);
          setIsTracking(true);

          const code = await createGroup(riderId, 'Grupeta');
          setCurrentGroup(code);
          setGroupCode(code);
          setGroupName('Grupeta');
          setIsLeader(true);
          setShowGroupModal(false);
        } catch (e: any) {
          Alert.alert('Error', e.message);
        } finally {
          setIsLoading(false);
        }
      } else {
        setRiderName(name);
        const code = await createGroup(getRiderId(), 'Grupeta');
        setCurrentGroup(code);
        setGroupCode(code);
        setGroupName('Grupeta');
        setIsLeader(true);
        setShowGroupModal(false);
      }
    },
    [isTracking]
  );

  const handleJoinGroup = useCallback(
    async (code: string, name: string) => {
      if (!isTracking) {
        setIsLoading(true);
        try {
          setRiderName(name);
          const riderId = await startTracking(
            (lat, lon) => {
              mapRef.current?.animateToRegion(
                { latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 },
                800
              );
            },
            (msg) => Alert.alert('Error de Ubicación', msg)
          );
          setMyRiderId(riderId);
          setIsTracking(true);

          const session = await joinGroup(riderId, code);
          setCurrentGroup(code);
          setGroupCode(code);
          setGroupName(session.group_name);
          setIsLeader(false);
          setShowGroupModal(false);
        } catch (e: any) {
          throw e; // Re-throw para que el modal lo muestre
        } finally {
          setIsLoading(false);
        }
      } else {
        setRiderName(name);
        const session = await joinGroup(getRiderId(), code);
        setCurrentGroup(code);
        setGroupCode(code);
        setGroupName(session.group_name);
        setIsLeader(false);
        setShowGroupModal(false);
      }
    },
    [isTracking]
  );

  const handleLeaveGroup = useCallback(async () => {
    if (!groupCode) return;
    if (isLeader) {
      Alert.alert('Cerrar Grupeta', '¿Seguro? Todos los ciclistas serán expulsados.', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar',
          style: 'destructive',
          onPress: async () => {
            await closeGroup(groupCode);
            setGroupCode(null);
            setCurrentGroup(null);
            setIsLeader(false);
            setStragglerIds(new Set());
          },
        },
      ]);
    } else {
      await leaveGroup(getRiderId());
      setGroupCode(null);
      setCurrentGroup(null);
      setStragglerIds(new Set());
    }
  }, [groupCode, isLeader]);

  const ridersArray = Object.values(riders);

  // Contar miembros del grupo
  const groupMemberCount = groupCode
    ? ridersArray.filter((r) => r.group_code === groupCode).length
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={{
          latitude: 37.1773,
          longitude: -3.5986,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false}
        showsCompass={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {ridersArray.map((rider) => (
          <RiderMarker
            key={rider.rider_id}
            rider={rider}
            isMe={rider.rider_id === myRiderId}
            isStraggler={stragglerIds.has(rider.rider_id)}
          />
        ))}
      </MapView>

      {/* Zona superior: HUD de grupo o botón de tracking */}
      {groupCode ? (
        <GroupHUD
          groupCode={groupCode}
          groupName={groupName}
          memberCount={groupMemberCount}
          isLeader={isLeader}
          onLeave={handleLeaveGroup}
        />
      ) : (
        <TrackingButton
          isTracking={isTracking}
          isLoading={isLoading}
          onPress={handleTrackingPress}
        />
      )}

      {/* Banner de alertas */}
      <AlertBanner alert={latestAlert} />

      {/* Panel inferior */}
      <BottomPanel
        riders={ridersArray}
        myRiderId={myRiderId}
        groupCode={groupCode}
        onGroupPress={() => setShowGroupModal(true)}
        stragglerIds={stragglerIds}
      />

      {/* Modal de crear/unir grupo */}
      <GroupModal
        visible={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onCreateGroup={handleCreateGroup}
        onJoinGroup={handleJoinGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d1d2b',
  },
  map: {
    flex: 1,
  },
});
