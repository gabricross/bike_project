/**
 * Simulador de Grupeta — Simula 3 ciclistas por Granada.
 * Uno de ellos se "descuelga" después de 30 segundos para probar la alerta.
 * 
 * USO:
 *   1. Crea una grupeta desde la app y copia el código de 4 dígitos.
 *   2. Ejecuta: node simulador_garmin.js <CÓDIGO>
 *      Ejemplo: node simulador_garmin.js 7294
 *   3. Los 3 ciclistas simulados se unirán a tu grupeta automáticamente.
 */

const SUPABASE_URL = "https://mcwcpycazdhudfdltzrg.supabase.co/rest/v1/active_riders";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jd2NweWNhemRodWRmZGx0enJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTQ1NTQsImV4cCI6MjA5NDQzMDU1NH0.lV7r5Gca4CLW-Dg6XSSok1i8coI-ZmP5yIvQKot_Tw0";

const GROUP_CODE = process.argv[2] || null;

// Ruta circular por Granada
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

// 3 ciclistas simulados
const riders = [
  { id: "sim_carlos", name: "Carlos (Sim)", index: 0 },
  { id: "sim_maria",  name: "María (Sim)",  index: 2 },
  { id: "sim_pedro",  name: "Pedro (Sim)",  index: 4 },  // Pedro se descolgará
];

let tick = 0;
const PEDRO_STRAGGLE_AFTER = 6; // Después de 30s (6 ticks * 5s) Pedro se queda atrás

console.log("🚴 Simulador de Grupeta — 3 ciclistas en Granada");
if (GROUP_CODE) {
  console.log(`   📌 Grupo: ${GROUP_CODE}`);
} else {
  console.log("   ⚠️  Sin grupo (modo libre). Usa: node simulador_garmin.js <CÓDIGO>");
}
console.log("   Enviando datos cada 5 segundos...\n");

async function sendUpdate(rider, lat, lon) {
  const body = {
    rider_id: rider.id,
    rider_name: rider.name,
    latitude: lat,
    longitude: lon,
  };
  if (GROUP_CODE) body.group_code = GROUP_CODE;

  try {
    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      console.log(`   ✅ ${rider.name} — Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`);
    } else {
      console.error(`   ❌ ${rider.name} — Error: ${response.status}`);
    }
  } catch (error) {
    console.error(`   ❌ ${rider.name} — Red:`, error.message);
  }
}

setInterval(async () => {
  tick++;
  console.log(`\n📍 Tick ${tick}:`);

  for (const rider of riders) {
    let routeIndex;

    // Pedro se descuelga después del tick 6
    if (rider.id === "sim_pedro" && tick > PEDRO_STRAGGLE_AFTER) {
      // Pedro se queda atrás en un punto fijo
      routeIndex = PEDRO_STRAGGLE_AFTER % ROUTE.length;
      console.log(`   ⚠️  Pedro se ha descolgado (parado en punto ${routeIndex + 1})`);
    } else {
      routeIndex = (rider.index + tick) % ROUTE.length;
    }

    const point = ROUTE[routeIndex];
    const lat = point.lat + (Math.random() - 0.5) * 0.0002;
    const lon = point.lon + (Math.random() - 0.5) * 0.0002;

    await sendUpdate(rider, lat, lon);
  }
}, 5000);

// Limpiar al cerrar
process.on('SIGINT', async () => {
  console.log("\n\n🧹 Limpiando ciclistas simulados de Supabase...");
  for (const rider of riders) {
    try {
      await fetch(`${SUPABASE_URL}?rider_id=eq.${rider.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
        }
      });
      console.log(`   🗑️ ${rider.name} eliminado`);
    } catch (e) {}
  }
  console.log("👋 ¡Hasta la próxima!\n");
  process.exit(0);
});
