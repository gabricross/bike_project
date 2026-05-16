import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  isTracking: boolean;
  isLoading: boolean;
  onPress: () => void;
};

/**
 * Botón flotante de tracking.
 * - Cuando está inactivo: muestra un botón grande y llamativo "Compartir Ruta"
 * - Cuando está activo: cambia a un botón rojo pulsante "Detener"
 */
export default function TrackingButton({ isTracking, isLoading, onPress }: Props) {
  if (isLoading) {
    return (
      <View style={[styles.button, styles.loadingButton]}>
        <ActivityIndicator color="#fff" size="small" />
        <Text style={styles.buttonText}>Conectando GPS...</Text>
      </View>
    );
  }

  if (isTracking) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.stopButton]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={styles.stopIcon}>
          <Ionicons name="stop" size={14} color="#fff" />
        </View>
        <Text style={styles.buttonText}>Detener Emisión</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, styles.startButton]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name="navigate" size={18} color="#fff" />
      <Text style={styles.buttonText}>Compartir mi Ruta</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  startButton: {
    backgroundColor: '#FF6B35',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  loadingButton: {
    backgroundColor: 'rgba(50, 50, 60, 0.9)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  stopIcon: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
