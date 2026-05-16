import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
      // NOTA CRÍTICA: En Android, usar la prop `anchor` personalizada recorta los marcadores custom.
      // Por eso NO usamos `anchor` aquí, y diseñamos el marcador como un "pin" clásico 
      // donde la punta inferior apunta a la coordenada exacta.
      tracksViewChanges={true}
    >
      <View style={styles.markerContainer}>
        {/* Velocidad encima */}
        {rider.speed > 0 && (
          <View style={[styles.speedBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.speedText}>{rider.speed.toFixed(0)}</Text>
          </View>
        )}
        
        {/* Círculo con el icono original de la bici */}
        <View style={[styles.circle, { backgroundColor: accentColor }]}>
          <Ionicons
            name={isStraggler ? 'warning' : 'bicycle'}
            size={18}
            color="#fff"
          />
        </View>
        
        {/* Punta del pin apuntando a la coordenada */}
        <View style={[styles.triangle, { borderTopColor: accentColor }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    // Aseguramos un contenedor lo suficientemente grande sin recortes
    width: 60,
    paddingBottom: 2, 
  },
  speedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  speedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    // Las sombras nativas a veces causan recortes en Android, mejor desactivadas en el pin
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    marginTop: -2, // Para que se solape ligeramente con el círculo
  },
});
