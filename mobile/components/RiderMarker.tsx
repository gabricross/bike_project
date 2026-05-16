import React from 'react';
import { Platform } from 'react-native';
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

  const speedDesc = rider.speed ? `${rider.speed.toFixed(0)} km/h` : '';

  return (
    <Marker
      coordinate={{
        latitude: rider.latitude,
        longitude: rider.longitude,
      }}
      title={displayName}
      description={speedDesc}
      pinColor={accentColor}
    />
  );
}
