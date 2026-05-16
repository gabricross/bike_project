import * as Location from 'expo-location';
import { supabase } from './supabase';

// ID único para esta instancia del móvil
// En producción se usaría el ID del usuario autenticado
const RIDER_ID = `mobile_${Math.random().toString(36).substring(2, 8)}`;

let trackingSubscription: Location.LocationSubscription | null = null;
let isTracking = false;

/**
 * Solicita permisos de ubicación al usuario.
 * Retorna true si fueron concedidos.
 */
export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') {
    return false;
  }
  return true;
}

/**
 * Inicia el tracking GPS optimizado para batería.
 *
 * Estrategia de ahorro de batería (similar a Strava en modo background):
 * - Usa `Accuracy.Balanced` en lugar de `BestForNavigation` → reduce el uso
 *   del chip GPS de alta precisión y permite que el SO use Wi-Fi/torres celulares.
 * - `distanceInterval: 10` → solo genera un nuevo evento si el usuario se ha
 *   movido al menos 10 metros, evitando actualizaciones innecesarias cuando
 *   el ciclista está parado (semáforo, descanso).
 * - `timeInterval: 5000` → como máximo una lectura cada 5 segundos, incluso
 *   si el usuario se mueve rápido. Esto limita las escrituras a Supabase.
 *
 * En apps como Strava se usa Background Location + Kalman Filter, pero para
 * el MVP en foreground, esta configuración es un buen equilibrio precisión/batería.
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
      timeInterval: 5000,        // Máximo una lectura cada 5s
      distanceInterval: 10,      // Solo si te mueves ≥10m
    },
    async (location) => {
      const { latitude, longitude } = location.coords;

      // Notificar a la UI
      onLocationUpdate(latitude, longitude);

      // UPSERT a Supabase
      const { error } = await supabase.from('active_riders').upsert(
        {
          rider_id: RIDER_ID,
          latitude,
          longitude,
        },
        { onConflict: 'rider_id' }
      );

      if (error) {
        console.error('Error enviando ubicación a Supabase:', error.message);
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

  // Eliminar al rider de la tabla para que desaparezca del mapa de los demás
  await supabase.from('active_riders').delete().eq('rider_id', RIDER_ID);
}

export function getIsTracking(): boolean {
  return isTracking;
}

export function getRiderId(): string {
  return RIDER_ID;
}
