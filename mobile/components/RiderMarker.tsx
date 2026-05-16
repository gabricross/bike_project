import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { Rider } from '../lib/supabase';
import { Colors } from '../constants/theme';

type Props = {
  rider: Rider;
  isMe: boolean;
  isStraggler?: boolean;
};

export default function RiderMarker({ rider, isMe, isStraggler = false }: Props) {
  const displayName = isMe
    ? 'Tú'
    : rider.rider_name || rider.rider_id.substring(0, 8);

  const accentColor = isMe
    ? Colors.primary
    : isStraggler
    ? Colors.warning
    : Colors.secondary;

  // SOLUCIÓN DEFINITIVA ANDROID:
  // El bug de react-native-maps en Android asigna un bitmap del tamaño de Yoga
  // del componente <Marker>, que por defecto es 0 o muy pequeño, recortando el contenido.
  // Pasamos `style={{ width, height }}` al <Marker> para forzar el tamaño del bitmap.
  const MARKER_W = 48;
  const MARKER_H = 48;

  return (
    <Marker
      coordinate={{
        latitude: rider.latitude,
        longitude: rider.longitude,
      }}
      title={displayName}
      description={rider.speed ? `${rider.speed.toFixed(0)} km/h` : ''}
      tracksViewChanges={true}
      // Fuerza el tamaño del bitmap en Android
      style={{ width: MARKER_W, height: MARKER_H }}
    >
      {/* collapsable={false} impide que Android optimice el árbol de Views */}
      <View
        collapsable={false}
        style={{
          width: MARKER_W,
          height: MARKER_H,
          alignItems: 'center',
          justifyContent: 'center',
          // opacity < 1 fuerza un render layer propio en Android, evitando recortes
          opacity: 0.99,
        }}
      >
        <View style={[styles.circle, { backgroundColor: accentColor }]}>
          <Ionicons
            name={isStraggler ? 'warning' : 'bicycle'}
            size={20}
            color="#fff"
          />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
});
