import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mcwcpycazdhudfdltzrg.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jd2NweWNhemRodWRmZGx0enJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTQ1NTQsImV4cCI6MjA5NDQzMDU1NH0.lV7r5Gca4CLW-Dg6XSSok1i8coI-ZmP5yIvQKot_Tw0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export type Rider = {
  rider_id: string;
  latitude: number;
  longitude: number;
  last_updated: string;
};
