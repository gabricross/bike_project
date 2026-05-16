import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Radius, Spacing, Shadows } from '../constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreateGroup: (name: string) => Promise<void>;
  onJoinGroup: (code: string, name: string) => Promise<void>;
};

export default function GroupModal({
  visible,
  onClose,
  onCreateGroup,
  onJoinGroup,
}: Props) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [riderName, setRiderName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setMode('menu');
    setRiderName('');
    setJoinCode('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleCreate = async () => {
    if (!riderName.trim()) { setError('Introduce tu nombre'); return; }
    setLoading(true);
    setError('');
    try {
      await onCreateGroup(riderName.trim());
      reset();
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || joinCode.length !== 4) {
      setError('Código de 4 dígitos');
      return;
    }
    if (!riderName.trim()) { setError('Introduce tu nombre'); return; }
    setLoading(true);
    setError('');
    try {
      await onJoinGroup(joinCode.trim(), riderName.trim());
      reset();
    } catch (e: any) {
      setError(e.message || 'Grupo no encontrado');
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {mode === 'menu'
                  ? 'Grupeta'
                  : mode === 'create'
                  ? 'Crear Grupeta'
                  : 'Unirse'}
              </Text>
              <Text style={styles.subtitle}>
                {mode === 'menu'
                  ? 'Pedalea en grupo, en tiempo real'
                  : mode === 'create'
                  ? 'Genera un código para tu pelotón'
                  : 'Introduce el código de 4 dígitos'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={28} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Menu */}
          {mode === 'menu' && (
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuCard}
                onPress={() => setMode('create')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={Colors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.menuIconBg}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </LinearGradient>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuBtnTitle}>Crear Grupeta</Text>
                  <Text style={styles.menuBtnSub}>Sé el líder del pelotón</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuCard}
                onPress={() => setMode('join')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={Colors.gradientSecondary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.menuIconBg}
                >
                  <Ionicons name="enter" size={22} color="#fff" />
                </LinearGradient>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuBtnTitle}>Unirme</Text>
                  <Text style={styles.menuBtnSub}>Tengo el código</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Create */}
          {mode === 'create' && (
            <View style={styles.formContainer}>
              <Text style={styles.label}>Tu nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Carlos"
                placeholderTextColor={Colors.textTertiary}
                value={riderName}
                onChangeText={setRiderName}
                maxLength={20}
                autoFocus
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity onPress={handleCreate} disabled={loading} activeOpacity={0.8}>
                <LinearGradient
                  colors={Colors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="flash" size={18} color="#fff" />
                      <Text style={styles.actionBtnText}>Crear y Empezar</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMode('menu'); setError(''); }}>
                <Text style={styles.backLink}>← Volver</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Join */}
          {mode === 'join' && (
            <View style={styles.formContainer}>
              <Text style={styles.label}>Tu nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: María"
                placeholderTextColor={Colors.textTertiary}
                value={riderName}
                onChangeText={setRiderName}
                maxLength={20}
              />
              <Text style={styles.label}>Código</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="0000"
                placeholderTextColor={Colors.textTertiary}
                value={joinCode}
                onChangeText={setJoinCode}
                keyboardType="number-pad"
                maxLength={4}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity onPress={handleJoin} disabled={loading} activeOpacity={0.8}>
                <LinearGradient
                  colors={Colors.gradientSecondary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="enter" size={18} color="#fff" />
                      <Text style={styles.actionBtnText}>Unirme</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMode('menu'); setError(''); }}>
                <Text style={styles.backLink}>← Volver</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    backgroundColor: Colors.bgCardSolid,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xxl,
  },
  title: {
    color: Colors.text,
    ...Typography.largeTitle,
  },
  subtitle: {
    color: Colors.textSecondary,
    ...Typography.body,
    marginTop: 4,
  },
  closeBtn: { padding: 2 },
  // Menu cards
  menuContainer: { gap: Spacing.md },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: { flex: 1 },
  menuBtnTitle: {
    color: Colors.text,
    ...Typography.headline,
  },
  menuBtnSub: {
    color: Colors.textSecondary,
    ...Typography.caption,
    marginTop: 2,
  },
  // Form
  formContainer: { gap: Spacing.md },
  label: {
    color: Colors.textSecondary,
    ...Typography.caption,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.bgSubtle,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    color: Colors.text,
    ...Typography.body,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 14,
    paddingVertical: 18,
  },
  error: {
    color: Colors.danger,
    ...Typography.callout,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionBtnText: {
    color: Colors.text,
    ...Typography.headline,
  },
  backLink: {
    color: Colors.textTertiary,
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
