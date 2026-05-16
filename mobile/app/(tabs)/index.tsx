import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import MapView from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';

import { supabase } from '../../lib/supabase';
import type { Rider } from '../../lib/supabase';
import { startTracking, stopTracking, getRiderId } from '../../lib/location';

import RiderMarker from '../../components/RiderMarker';
import BottomPanel from '../../components/BottomPanel';
import TrackingButton from '../../components/TrackingButton';

// Estilo oscuro premium para Google Maps (inspirado en Apple Maps / Uber)
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
  const mapRef = useRef<MapView>(null);

  // ─── Carga inicial + Suscripción Realtime ───────────────────────
  useEffect(() => {
    // Fetch estado actual
    const fetchInitial = async () => {
      const { data, error } = await supabase.from('active_riders').select('*');
      if (!error && data) {
        const map: Record<string, Rider> = {};
        data.forEach((r: Rider) => {
          map[r.rider_id] = r;
        });
        setRiders(map);
      }
    };
    fetchInitial();

    // Suscripción en tiempo real
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
              delete updated[(oldRec as Rider).rider_id];
            }
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ─── Tracking toggle ───────────────────────────────────────────
  const handleTrackingPress = useCallback(async () => {
    if (isTracking) {
      await stopTracking();
      setIsTracking(false);
      setMyRiderId(null);
      return;
    }

    setIsLoading(true);
    try {
      const riderId = await startTracking(
        // onLocationUpdate: centrar cámara en la propia posición
        (lat, lon) => {
          mapRef.current?.animateToRegion(
            {
              latitude: lat,
              longitude: lon,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            800
          );
        },
        // onError
        (msg) => {
          Alert.alert('Error de Ubicación', msg);
        }
      );
      setMyRiderId(riderId);
      setIsTracking(true);
    } catch {
      // Permisos denegados — ya se mostró la alerta
    } finally {
      setIsLoading(false);
    }
  }, [isTracking]);

  const ridersArray = Object.values(riders);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={{
          latitude: 37.1773,  // Granada, España
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
          />
        ))}
      </MapView>

      {/* Botón flotante superior */}
      <TrackingButton
        isTracking={isTracking}
        isLoading={isLoading}
        onPress={handleTrackingPress}
      />

      {/* Panel inferior con lista de ciclistas */}
      <BottomPanel riders={ridersArray} myRiderId={myRiderId} />
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
