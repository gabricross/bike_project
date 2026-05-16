import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GroupAlert } from '../lib/supabase';
import { Colors, Typography, Radius, Spacing, Shadows } from '../constants/theme';

type Props = {
  alert: GroupAlert | null;
};

const ALERT_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  straggler: {
    icon: 'warning',
    color: Colors.warning,
    bg: Colors.warningMuted,
    label: 'DESCOLGADO',
  },
  disconnected: {
    icon: 'close-circle',
    color: Colors.danger,
    bg: Colors.dangerMuted,
    label: 'DESCONEXIÓN',
  },
  danger: {
    icon: 'car-sport',
    color: Colors.danger,
    bg: Colors.dangerMuted,
    label: 'PELIGRO',
  },
  message: {
    icon: 'chatbubble',
    color: Colors.secondary,
    bg: Colors.secondaryMuted,
    label: 'MENSAJE',
  },
};

export default function AlertBanner({ alert }: Props) {
  const [visible, setVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<GroupAlert | null>(null);
  const slideAnim = useState(new Animated.Value(-100))[0];
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (alert && alert !== currentAlert) {
      setCurrentAlert(alert);
      setVisible(true);

      // Slide in + fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => setVisible(false));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (!visible || !currentAlert) return null;

  const config = ALERT_CONFIG[currentAlert.alert_type] || ALERT_CONFIG.message;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY: slideAnim }],
          borderLeftColor: config.color,
        },
      ]}
    >
      <View style={[styles.iconBg, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon as any} size={18} color={config.color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {currentAlert.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
    backgroundColor: Colors.bgElevated,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.lg,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...Typography.micro,
    textTransform: 'uppercase',
  },
  message: {
    color: Colors.textSecondary,
    ...Typography.callout,
    marginTop: 2,
  },
});
