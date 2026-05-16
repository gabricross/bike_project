import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { createClient } from '@supabase/supabase-js';

// 1. Configuración de Supabase
const supabaseUrl = 'https://mcwcpycazdhudfdltzrg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jd2NweWNhemRodWRmZGx0enJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTQ1NTQsImV4cCI6MjA5NDQzMDU1NH0.lV7r5Gca4CLW-Dg6XSSok1i8coI-ZmP5yIvQKot_Tw0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [riders, setRiders] = useState({});

  useEffect(() => {
    // 2. Cargar el estado inicial
    const fetchInitialRiders = async () => {
      const { data, error } = await supabase.from('active_riders').select('*');
      if (!error && data) {
        const initialRiders = {};
        data.forEach(rider => {
          initialRiders[rider.rider_id] = rider;
        });
        setRiders(initialRiders);
      } else {
        console.error("Error cargando ciclistas:", error);
      }
    };
    
    fetchInitialRiders();

    // 3. Suscripción a eventos en tiempo real
    const subscription = supabase
      .channel('public:active_riders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_riders' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setRiders((prevRiders) => {
            const updatedRiders = { ...prevRiders };

            if (eventType === 'INSERT' || eventType === 'UPDATE') {
              updatedRiders[newRecord.rider_id] = newRecord;
            } else if (eventType === 'DELETE') {
              delete updatedRiders[oldRecord.rider_id];
            }

            return updatedRiders;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const ridersArray = Object.values(riders);

  return (
    <SafeAreaView style={styles.container}>
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: 40.416775,
          longitude: -3.703790,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {ridersArray.map((rider) => (
          <Marker
            key={rider.rider_id}
            coordinate={{
              latitude: rider.latitude,
              longitude: rider.longitude,
            }}
            title={`Rider: ${rider.rider_id}`}
            description={`Última señal: ${new Date(rider.last_updated).toLocaleTimeString()}`}
            pinColor="blue"
          />
        ))}
      </MapView>
      
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Ciclistas activos en vivo: {ridersArray.length}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  overlayText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
