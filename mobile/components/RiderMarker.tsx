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

  return (
    <Marker
      coordinate={{
        latitude: rider.latitude,
        longitude: rider.longitude,
      }}
      title={displayName}
      description={rider.speed ? `${rider.speed.toFixed(0)} km/h` : ''}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={true}
    >
      {/* Contenedor amplio para evitar recorte en Android */}
      <View style={styles.outerWrap}>
        {/* Anillo blanco */}
        <View style={styles.ring}>
          {/* Círculo de color con icono */}
          <View style={[styles.inner, { backgroundColor: accentColor }]}>
            <Ionicons
              name={isStraggler ? 'warning' : 'bicycle'}
              size={15}
              color="#fff"
            />
          </View>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
