import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import type { Rider } from '../lib/supabase';
import { Colors } from '../constants/theme';

type Props = {
  rider: Rider;
  isMe: boolean;
  isStraggler?: boolean;
};

export default function RiderMarker({ rider, isMe, isStraggler = false }: Props) {
  const displayName = isMe
    ? '📍 Tú'
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
      <View style={styles.wrapper} collapsable={false}>
        <View style={[styles.dot, { backgroundColor: accentColor }]} collapsable={false}>
          <Text style={styles.emoji}>{isStraggler ? '⚠️' : '🚴'}</Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  emoji: {
    fontSize: 18,
    textAlign: 'center',
  },
});
