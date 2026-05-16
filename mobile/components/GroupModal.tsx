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
import { Ionicons } from '@expo/vector-icons';

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
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [riderName, setRiderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setMode('menu');
    setGroupName('');
    setJoinCode('');
    setRiderName('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!riderName.trim()) {
      setError('Introduce tu nombre');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onCreateGroup(riderName.trim());
      reset();
    } catch (e: any) {
      setError(e.message || 'Error creando grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || joinCode.length !== 4) {
      setError('Introduce un código de 4 dígitos');
      return;
    }
    if (!riderName.trim()) {
      setError('Introduce tu nombre');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onJoinGroup(joinCode.trim(), riderName.trim());
      reset();
    } catch (e: any) {
      setError(e.message || 'Grupo no encontrado');
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>
              {mode === 'menu'
                ? '🚴 Grupeta'
                : mode === 'create'
                ? 'Crear Grupeta'
                : 'Unirse a Grupeta'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#aaa" />
            </TouchableOpacity>
          </View>

          {/* Menú principal */}
          {mode === 'menu' && (
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={[styles.menuButton, styles.createBtn]}
                onPress={() => setMode('create')}
              >
                <Ionicons name="add-circle" size={28} color="#fff" />
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuBtnTitle}>Crear Grupeta</Text>
                  <Text style={styles.menuBtnSub}>
                    Genera un código para tu pelotón
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuButton, styles.joinBtn]}
                onPress={() => setMode('join')}
              >
                <Ionicons name="enter" size={28} color="#fff" />
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuBtnTitle}>Unirme</Text>
                  <Text style={styles.menuBtnSub}>
                    Tengo el código de 4 dígitos
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Crear grupo */}
          {mode === 'create' && (
            <View style={styles.formContainer}>
              <Text style={styles.label}>Tu nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Carlos"
                placeholderTextColor="#555"
                value={riderName}
                onChangeText={setRiderName}
                maxLength={20}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity
                style={[styles.actionBtn, styles.createActionBtn]}
                onPress={handleCreate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="flash" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>
                      Crear y Empezar
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMode('menu'); setError(''); }}>
                <Text style={styles.backLink}>← Volver</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Unirse a grupo */}
          {mode === 'join' && (
            <View style={styles.formContainer}>
              <Text style={styles.label}>Tu nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: María"
                placeholderTextColor="#555"
                value={riderName}
                onChangeText={setRiderName}
                maxLength={20}
              />
              <Text style={styles.label}>Código de la Grupeta</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="0000"
                placeholderTextColor="#555"
                value={joinCode}
                onChangeText={setJoinCode}
                keyboardType="number-pad"
                maxLength={4}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity
                style={[styles.actionBtn, styles.joinActionBtn]}
                onPress={handleJoin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="enter" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Unirme</Text>
                  </>
                )}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  // Menú
  menuContainer: {
    gap: 14,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 14,
  },
  createBtn: {
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  joinBtn: {
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuBtnTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  menuBtnSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    marginTop: 2,
  },
  // Form
  formContainer: {
    gap: 10,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  codeInput: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 12,
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
  },
  createActionBtn: {
    backgroundColor: '#FF6B35',
  },
  joinActionBtn: {
    backgroundColor: '#6C63FF',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
