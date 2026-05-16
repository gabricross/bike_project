-- =====================================================
-- FASE 3: Añadir velocidad a active_riders
-- Ejecutar en Supabase SQL Editor
-- =====================================================
ALTER TABLE public.active_riders
  ADD COLUMN IF NOT EXISTS speed DOUBLE PRECISION DEFAULT 0;
