/**
 * Simulador de dispositivo Garmin para pruebas.
 * Simula un ciclista recorriendo una ruta circular por el centro de Granada.
 * Ejecutar: node simulador_garmin.js
 */

const SUPABASE_URL = "https://mcwcpycazdhudfdltzrg.supabase.co/rest/v1/active_riders";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jd2NweWNhemRodWRmZGx0enJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTQ1NTQsImV4cCI6MjA5NDQzMDU1NH0.lV7r5Gca4CLW-Dg6XSSok1i8coI-ZmP5yIvQKot_Tw0";
const RIDER_ID = "garmin_sim_001";

// Ruta circular por el centro de Granada (puntos de interés)
const ROUTE = [
  { lat: 37.1760, lon: -3.5988 },  // Catedral
  { lat: 37.1770, lon: -3.5970 },  // Plaza Nueva
  { lat: 37.1780, lon: -3.5930 },  // Carrera del Darro
  { lat: 37.1790, lon: -3.5890 },  // Paseo de los Tristes
  { lat: 37.1810, lon: -3.5870 },  // Cuesta del Chapiz
  { lat: 37.1830, lon: -3.5910 },  // Albaicín
  { lat: 37.1820, lon: -3.5950 },  // Mirador San Nicolás
  { lat: 37.1800, lon: -3.5970 },  // Bajada
  { lat: 37.1780, lon: -3.5990 },  // Gran Vía
];

let currentIndex = 0;

console.log("🚴 Simulador Garmin iniciado — Ruta por Granada");
console.log(`   Rider ID: ${RIDER_ID}`);
console.log("   Enviando datos cada 5 segundos...\n");

setInterval(async () => {
  const point = ROUTE[currentIndex % ROUTE.length];
  // Añadir un poco de ruido para simular movimiento natural
  const lat = point.lat + (Math.random() - 0.5) * 0.0003;
  const lon = point.lon + (Math.random() - 0.5) * 0.0003;

  console.log(`📍 Punto ${currentIndex % ROUTE.length + 1}/${ROUTE.length} — Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`);

  try {
    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        rider_id: RIDER_ID,
        latitude: lat,
        longitude: lon
      })
    });

    if (response.ok) {
      console.log("   ✅ Supabase actualizado\n");
    } else {
      console.error(`   ❌ Error HTTP: ${response.status}`, await response.text());
    }
  } catch (error) {
    console.error("   ❌ Error de red:", error.message);
  }

  currentIndex++;
}, 5000);
