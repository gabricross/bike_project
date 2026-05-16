import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GroupAlert } from '../lib/supabase';

type Props = {
  alert: GroupAlert | null;
};

const ALERT_CONFIG: Record<
  string,
  { icon: string; color: string; bgColor: string }
> = {
  straggler: {
    icon: 'warning',
    color: '#FBBF24',
    bgColor: 'rgba(251, 191, 36, 0.15)',
  },
  disconnected: {
    icon: 'close-circle',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  danger: {
    icon: 'car-sport',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.2)',
  },
  message: {
    icon: 'chatbubble',
    color: '#6C63FF',
    bgColor: 'rgba(108, 99, 255, 0.15)',
  },
};

/**
 * Banner de alerta flotante que aparece brevemente cuando hay un evento.
 * Se auto-oculta después de 5 segundos.
 */
export default function AlertBanner({ alert }: Props) {
  const [visible, setVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<GroupAlert | null>(null);
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (alert && alert !== currentAlert) {
      setCurrentAlert(alert);
      setVisible(true);

      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide después de 5s
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (!visible || !currentAlert) return null;

  const config = ALERT_CONFIG[currentAlert.alert_type] || ALERT_CONFIG.message;

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: config.bgColor }]}>
      <Ionicons
        name={config.icon as any}
        size={22}
        color={config.color}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: config.color }]}>
          {currentAlert.alert_type === 'straggler'
            ? '⚠️ Ciclista Descolgado'
            : currentAlert.alert_type === 'disconnected'
            ? '❌ Desconexión'
            : currentAlert.alert_type === 'danger'
            ? '🚗 Peligro'
            : '💬 Mensaje'}
        </Text>
        <Text style={styles.message}>{currentAlert.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },
});
