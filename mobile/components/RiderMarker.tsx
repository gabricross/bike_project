import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { Rider } from '../lib/supabase';
import { Colors, Shadows } from '../constants/theme';

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

  const speedStr = rider.speed ? `${rider.speed.toFixed(0)} km/h` : '';

  return (
    <Marker
      coordinate={{
        latitude: rider.latitude,
        longitude: rider.longitude,
      }}
      title={displayName}
      description={speedStr}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.wrapper}>
        {/* Speed badge encima del pin */}
        {rider.speed > 0 && (
          <View style={[styles.speedBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.speedText}>{rider.speed.toFixed(0)}</Text>
          </View>
        )}
        {/* Pin principal */}
        <View style={[styles.pin, { backgroundColor: accentColor }, Shadows.sm]}>
          <Ionicons
            name={isStraggler ? 'warning' : 'bicycle'}
            size={16}
            color="#fff"
          />
        </View>
        {/* Punta del pin */}
        <View style={[styles.arrow, { borderTopColor: accentColor }]} />
        {/* Nombre debajo */}
        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 70,
  },
  speedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 3,
  },
  speedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  name: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
});
