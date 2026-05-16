import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Radius, Shadows, Spacing } from '../constants/theme';

type Props = {
  isTracking: boolean;
  isLoading: boolean;
  onPress: () => void;
};

export default function TrackingButton({ isTracking, isLoading, onPress }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animación de pulso cuando está emitiendo
  useEffect(() => {
    if (isTracking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTracking]);

  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.button, styles.loadingButton]}>
          <ActivityIndicator color="#fff" size="small" />
          <Text style={styles.buttonText}>Conectando GPS...</Text>
        </View>
      </View>
    );
  }

  if (isTracking) {
    return (
      <View style={styles.wrapper}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
            <LinearGradient
              colors={Colors.gradientDanger}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.button, Shadows.glow(Colors.danger)]}
            >
              <View style={styles.stopIcon}>
                <Ionicons name="stop" size={12} color="#fff" />
              </View>
              <Text style={styles.buttonText}>Detener</Text>
              <View style={styles.livePulse} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <LinearGradient
          colors={Colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, Shadows.md]}
        >
          <Ionicons name="navigate" size={18} color="#fff" />
          <Text style={styles.buttonText}>Compartir mi Ruta</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: Radius.pill,
  },
  loadingButton: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    color: Colors.text,
    ...Typography.headline,
  },
  stopIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginLeft: 2,
  },
});
