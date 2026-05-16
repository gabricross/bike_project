import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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

  const speedStr = rider.speed ? `${rider.speed.toFixed(0)} km/h` : '';

  return (
    <Marker
      coordinate={{
        latitude: rider.latitude,
        longitude: rider.longitude,
      }}
      title={displayName}
      description={speedStr}
      anchor={{ x: 0.5, y: 0.85 }}
      tracksViewChanges={Platform.OS === 'ios'}
    >
      <View style={styles.wrapper}>
        {/* Speed badge encima del pin */}
        {rider.speed > 0 && (
          <View style={[styles.speedBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.speedText}>{rider.speed.toFixed(0)}</Text>
          </View>
        )}
        {/* Pin principal */}
        <View
          style={[
            styles.pin,
            { backgroundColor: accentColor },
          ]}
        >
          <Ionicons
            name={isStraggler ? 'warning' : 'bicycle'}
            size={14}
            color="#fff"
          />
        </View>
        {/* Punta del pin */}
        <View style={[styles.arrow, { borderTopColor: accentColor }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 2,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.9)',
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
});
