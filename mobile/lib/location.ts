import * as Location from 'expo-location';
import { supabase } from './supabase';

// ID único para esta instancia del móvil
const RIDER_ID = `mobile_${Math.random().toString(36).substring(2, 8)}`;

let trackingSubscription: Location.LocationSubscription | null = null;
let isTracking = false;
let currentGroupCode: string | null = null;
let riderName: string = 'Ciclista';

/**
 * Solicita permisos de ubicación al usuario.
 */
export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  return foreground === 'granted';
}

/**
 * Establece el nombre del ciclista.
 */
export function setRiderName(name: string): void {
  riderName = name;
}

/**
 * Establece el grupo actual.
 */
export function setCurrentGroup(groupCode: string | null): void {
  currentGroupCode = groupCode;
}

/**
 * Inicia el tracking GPS optimizado para batería.
 *
 * Estrategia de ahorro:
 * - Accuracy.Balanced → usa Wi-Fi/torres cuando puede
 * - distanceInterval: 10m → no actualiza si estás parado
 * - timeInterval: 5000ms → máximo una lectura cada 5s
 */
export async function startTracking(
  onLocationUpdate: (lat: number, lon: number) => void,
  onError: (msg: string) => void
): Promise<string> {
  if (isTracking) return RIDER_ID;

  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    onError('Se necesitan permisos de ubicación para compartir tu ruta.');
    throw new Error('Location permission denied');
  }

  isTracking = true;

  trackingSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    async (location) => {
      const { latitude, longitude } = location.coords;

      onLocationUpdate(latitude, longitude);

      // UPSERT a Supabase con nombre y grupo
      const { error } = await supabase.from('active_riders').upsert(
        {
          rider_id: RIDER_ID,
          rider_name: riderName,
          latitude,
          longitude,
          group_code: currentGroupCode,
        },
        { onConflict: 'rider_id' }
      );

      if (error) {
        console.error('Error enviando ubicación:', error.message);
      }
    }
  );

  return RIDER_ID;
}

/**
 * Detiene el tracking GPS y elimina al ciclista de la tabla.
 */
export async function stopTracking(): Promise<void> {
  if (trackingSubscription) {
    trackingSubscription.remove();
    trackingSubscription = null;
  }
  isTracking = false;
  currentGroupCode = null;

  await supabase.from('active_riders').delete().eq('rider_id', RIDER_ID);
}

export function getIsTracking(): boolean {
  return isTracking;
}

export function getRiderId(): string {
  return RIDER_ID;
}

export function getCurrentGroupCode(): string | null {
  return currentGroupCode;
}
