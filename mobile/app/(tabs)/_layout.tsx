import { Tabs } from 'expo-router';
import React from 'react';

/**
 * Layout simplificado: una sola pantalla (mapa) sin barra de tabs visible.
 * Si en el futuro se necesitan más pantallas (perfil, historial, etc.)
 * se pueden añadir aquí.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Ocultar la barra de tabs
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Mapa' }} />
    </Tabs>
  );
}
