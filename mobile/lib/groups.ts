import { supabase } from './supabase';
import type { GroupSession, GroupAlert } from './supabase';

/**
 * Genera un código aleatorio de 4 dígitos para la grupeta.
 */
function generateGroupCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Crea una nueva sesión de grupo (el usuario es el líder).
 */
export async function createGroup(
  leaderId: string,
  groupName: string = 'Grupeta'
): Promise<string> {
  const groupCode = generateGroupCode();

  const { error } = await supabase.from('group_sessions').insert({
    group_code: groupCode,
    leader_id: leaderId,
    group_name: groupName,
    is_active: true,
  });

  if (error) {
    console.error('Error creando grupo:', error.message);
    throw new Error('No se pudo crear el grupo');
  }

  // Actualizar el rider con el código de grupo
  await supabase
    .from('active_riders')
    .update({ group_code: groupCode })
    .eq('rider_id', leaderId);

  return groupCode;
}

/**
 * Unirse a un grupo existente.
 */
export async function joinGroup(
  riderId: string,
  groupCode: string
): Promise<GroupSession> {
  // Verificar que el grupo existe y está activo
  const { data, error } = await supabase
    .from('group_sessions')
    .select('*')
    .eq('group_code', groupCode)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error('Grupo no encontrado o ya no está activo');
  }

  // Actualizar el rider con el código de grupo
  await supabase
    .from('active_riders')
    .update({ group_code: groupCode })
    .eq('rider_id', riderId);

  return data as GroupSession;
}

/**
 * Salir de un grupo.
 */
export async function leaveGroup(riderId: string): Promise<void> {
  await supabase
    .from('active_riders')
    .update({ group_code: null })
    .eq('rider_id', riderId);
}

/**
 * Cerrar un grupo (solo el líder).
 */
export async function closeGroup(groupCode: string): Promise<void> {
  await supabase
    .from('group_sessions')
    .update({ is_active: false })
    .eq('group_code', groupCode);

  // Quitar el group_code de todos los riders del grupo
  await supabase
    .from('active_riders')
    .update({ group_code: null })
    .eq('group_code', groupCode);
}

/**
 * Enviar una alerta al grupo.
 */
export async function sendGroupAlert(
  groupCode: string,
  alertType: GroupAlert['alert_type'],
  triggeredBy: string,
  message: string,
  targetRider?: string
): Promise<void> {
  const { error } = await supabase.from('group_alerts').insert({
    group_code: groupCode,
    alert_type: alertType,
    triggered_by: triggeredBy,
    target_rider: targetRider || null,
    message,
  });

  if (error) {
    console.error('Error enviando alerta:', error.message);
  }
}

/**
 * Calcula la distancia en metros entre dos coordenadas GPS (Haversine).
 */
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
