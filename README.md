# 🚴‍♂️ BiciTrack

BiciTrack es una aplicación de ciclismo en tiempo real que permite visualizar y compartir ubicaciones GPS. Construida con una arquitectura serverless, soporta la emisión de GPS nativa desde dispositivos Garmin y desde la propia app móvil.

## 🌟 Características
- **Tracking en Vivo:** Emite tu posición GPS desde el móvil o reloj Garmin.
- **Backend Realtime:** Sincronización instantánea de las ubicaciones con Supabase.
- **Diseño Premium:** Interfaz oscura, marcadores personalizados y panel de ciclistas activos.
- **Multiplataforma:** Cliente móvil con React Native (Expo) y cliente Garmin con Monkey C.

## 🏗️ Arquitectura
- **Mobile (Frontend):** React Native, Expo, React Native Maps, Supabase JS.
- **Backend:** PostgreSQL (Supabase) con Realtime (WebSockets) y Row Level Security (RLS).
- **Wearable:** Dispositivo Garmin enviando telemetría vía Monkey C a Supabase REST API.

---

## 🚀 Cómo ejecutar el proyecto en tu entorno local

Para probar la aplicación en tu entorno, clona este repositorio y sigue los pasos a continuación.

### 1. Requisitos Previos
- Node.js (v20 o superior).
- Cuenta gratuita en [Supabase](https://supabase.com/) (si deseas tener tu propia base de datos).
- (Opcional) Garmin Connect IQ SDK para compilar la aplicación del reloj.

### 2. Levantar la App Móvil
Abre una terminal y ejecuta:

```bash
cd mobile
npm install
npm run start
```
Escanea el código QR desde la aplicación oficial de **Expo Go** en tu dispositivo móvil (Android/iOS) para visualizar la aplicación y empezar a emitir tu ubicación.

### 3. Simulador de Pruebas (Opcional)
Si quieres ver a un ciclista moviéndose por Granada sin salir de casa, ejecuta nuestro simulador en Node.js en una terminal nueva:

```bash
node simulador_garmin.js
```
Esto comenzará a inyectar posiciones GPS en Supabase automáticamente.

### 4. Compilar la App Garmin (Relojes)
1. Instala el SDK de Garmin Connect IQ y la extensión de VS Code "Monkey C".
2. Abre la carpeta `garmin/` del proyecto.
3. Compila y lanza la aplicación en el emulador de dispositivos Garmin o transfiere el archivo `.prg` compilado a la carpeta `GARMIN/APPS/` de tu reloj físico vía USB.

---

## 🔒 Configurar tu propia base de datos (Supabase)

Si quieres usar tu propia base de datos:
1. Crea un proyecto en Supabase y ve al **SQL Editor**.
2. Ejecuta el siguiente script para inicializar la tabla:

```sql
CREATE TABLE public.active_riders (
    rider_id TEXT PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.active_riders;
ALTER TABLE public.active_riders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.active_riders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous updates" ON public.active_riders FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous selects" ON public.active_riders FOR SELECT TO anon USING (true);
```

3. Actualiza las constantes `SUPABASE_URL` y `ANON_KEY` en `mobile/lib/supabase.ts` y en `simulador_garmin.js` con las de tu nuevo proyecto.
