import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
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

  const emoji = isStraggler ? '⚠️' : '🚴';

  // Usamos SVG para garantizar que Android dibuje el círculo perfecto
  // sin problemas de recortes (clipping) típicos de los <View> con borderRadius.
  return (
    <Marker
      coordinate={{
        latitude: rider.latitude,
        longitude: rider.longitude,
      }}
      title={displayName}
      description={rider.speed ? `${rider.speed.toFixed(0)} km/h` : ''}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={Platform.OS === 'android'}
    >
      <View style={styles.container} collapsable={false}>
        <Svg width="44" height="44" viewBox="0 0 44 44">
          {/* Borde blanco exterior */}
          <Circle cx="22" cy="22" r="20" fill="#ffffff" />
          {/* Círculo de color principal */}
          <Circle cx="22" cy="22" r="17" fill={accentColor} />
          {/* Emoji centrado */}
          <SvgText
            x="22"
            y="28"
            fontSize="16"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {emoji}
          </SvgText>
        </Svg>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    // La sombra en iOS, Android la ignora si recorta pero el SVG lo evita
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
});
