import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mcwcpycazdhudfdltzrg.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jd2NweWNhemRodWRmZGx0enJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTQ1NTQsImV4cCI6MjA5NDQzMDU1NH0.lV7r5Gca4CLW-Dg6XSSok1i8coI-ZmP5yIvQKot_Tw0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// ─── Tipos ─────────────────────────────────────────────
export type Rider = {
  rider_id: string;
  rider_name: string;
  latitude: number;
  longitude: number;
  last_updated: string;
  group_code: string | null;
};

export type GroupSession = {
  group_code: string;
  leader_id: string;
  group_name: string;
  created_at: string;
  is_active: boolean;
};

export type GroupAlert = {
  id: number;
  group_code: string;
  alert_type: 'straggler' | 'disconnected' | 'danger' | 'message';
  triggered_by: string;
  target_rider: string | null;
  message: string;
  created_at: string;
};
