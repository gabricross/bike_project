-- =====================================================
-- FASE 2: Sistema de Grupetas (Swarm Telemetry)
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Añadir campo de sesión de grupo a active_riders
ALTER TABLE public.active_riders
  ADD COLUMN IF NOT EXISTS rider_name TEXT DEFAULT 'Ciclista',
  ADD COLUMN IF NOT EXISTS group_code TEXT DEFAULT NULL;

-- 2. Tabla de sesiones de grupo
CREATE TABLE IF NOT EXISTS public.group_sessions (
    group_code TEXT PRIMARY KEY,            -- Código de 4 dígitos
    leader_id TEXT NOT NULL,                -- ID del líder que creó el grupo
    group_name TEXT DEFAULT 'Grupeta',      -- Nombre del grupo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.group_sessions;
ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts on group_sessions" ON public.group_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous updates on group_sessions" ON public.group_sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous selects on group_sessions" ON public.group_sessions FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous deletes on group_sessions" ON public.group_sessions FOR DELETE TO anon USING (true);

-- 3. Tabla de alertas de grupo (coche atrás, descolgado, desconexión)
CREATE TABLE IF NOT EXISTS public.group_alerts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_code TEXT NOT NULL,
    alert_type TEXT NOT NULL,               -- 'straggler' | 'disconnected' | 'danger' | 'message'
    triggered_by TEXT NOT NULL,             -- rider_id que originó la alerta
    target_rider TEXT DEFAULT NULL,         -- rider_id afectado (si aplica)
    message TEXT NOT NULL,                  -- Mensaje legible
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.group_alerts;
ALTER TABLE public.group_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts on group_alerts" ON public.group_alerts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous selects on group_alerts" ON public.group_alerts FOR SELECT TO anon USING (true);
