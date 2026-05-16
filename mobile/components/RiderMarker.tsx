import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { Rider } from '../lib/supabase';

type Props = {
  rider: Rider;
  isMe: boolean;
  isStraggler?: boolean;
};

/**
 * Marcador personalizado premium.
 * - Naranja = tú
 * - Violeta = compañero de grupo
 * - Amarillo pulsante = descolgado del grupo
 */
export default function RiderMarker({ rider, isMe, isStraggler = false }: Props) {
  const secondsAgo = Math.floor(
    (Date.now() - new Date(rider.last_updated).getTime()) / 1000
  );

  const displayName = isMe
    ? '📍 Tú'
    : rider.rider_name || `Ciclista ${rider.rider_id.substring(0, 8)}`;

  return (
    <Marker
      coordinate={{
        latitude: rider.latitude,
        longitude: rider.longitude,
      }}
      title={displayName}
      description={
        isStraggler
          ? '⚠️ Descolgado del grupo'
          : `Actualizado hace ${secondsAgo}s`
      }
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View
        style={[
          styles.markerOuter,
          isMe
            ? styles.markerMe
            : isStraggler
            ? styles.markerStraggler
            : styles.markerOther,
        ]}
      >
        <View
          style={[
            styles.markerInner,
            isMe
              ? styles.innerMe
              : isStraggler
              ? styles.innerStraggler
              : styles.innerOther,
          ]}
        >
          <Ionicons
            name={isStraggler ? 'warning' : 'bicycle'}
            size={16}
            color="#fff"
          />
        </View>
      </View>
      <View
        style={[
          styles.markerArrow,
          isMe
            ? styles.arrowMe
            : isStraggler
            ? styles.arrowStraggler
            : styles.arrowOther,
        ]}
      />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  markerMe: { backgroundColor: '#fff' },
  markerOther: { backgroundColor: 'rgba(255,255,255,0.85)' },
  markerStraggler: { backgroundColor: '#FBBF24' },
  markerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerMe: { backgroundColor: '#FF6B35' },
  innerOther: { backgroundColor: '#6C63FF' },
  innerStraggler: { backgroundColor: '#D97706' },
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
  arrowMe: { borderTopColor: '#fff' },
  arrowOther: { borderTopColor: 'rgba(255,255,255,0.85)' },
  arrowStraggler: { borderTopColor: '#FBBF24' },
});
