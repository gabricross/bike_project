import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { Rider } from '../lib/supabase';

type Props = {
  rider: Rider;
  isMe: boolean;
};

/**
 * Marcador personalizado premium para cada ciclista.
 * - "isMe" lo pinta de color vibrante (el propio usuario)
 * - Los demás tienen un color más neutro
 */
export default function RiderMarker({ rider, isMe }: Props) {
  const secondsAgo = Math.floor(
    (Date.now() - new Date(rider.last_updated).getTime()) / 1000
  );

  return (
    <Marker
      coordinate={{
        latitude: rider.latitude,
        longitude: rider.longitude,
      }}
      title={isMe ? '📍 Tú' : `Ciclista ${rider.rider_id.substring(0, 8)}`}
      description={`Actualizado hace ${secondsAgo}s`}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {/* Marcador visual personalizado */}
      <View style={[styles.markerOuter, isMe ? styles.markerMe : styles.markerOther]}>
        <View style={[styles.markerInner, isMe ? styles.innerMe : styles.innerOther]}>
          <Ionicons
            name="bicycle"
            size={16}
            color={isMe ? '#fff' : '#E8E8E8'}
          />
        </View>
      </View>
      {/* Puntita triangular abajo */}
      <View style={[styles.markerArrow, isMe ? styles.arrowMe : styles.arrowOther]} />
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra suave
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  markerMe: {
    backgroundColor: '#fff',
  },
  markerOther: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  markerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerMe: {
    backgroundColor: '#FF6B35', // Naranja vibrante tipo Strava
  },
  innerOther: {
    backgroundColor: '#6C63FF', // Violeta moderno
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -2,
  },
  arrowMe: {
    borderTopColor: '#fff',
  },
  arrowOther: {
    borderTopColor: 'rgba(255,255,255,0.85)',
  },
});
