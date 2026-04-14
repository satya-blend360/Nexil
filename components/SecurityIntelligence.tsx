import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';

export default function SecurityIntelligence() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number; speed: number | null } | null>(null);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    // 1. App Uptime
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);

    // 2. Location & Speed
    let locationSubscription: any;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1 },
          (loc) => {
            setLocation({
              lat: loc.coords.latitude,
              lon: loc.coords.longitude,
              speed: loc.coords.speed
            });
          }
        );
      }
    })();

    return () => {
      clearInterval(interval);
      locationSubscription?.remove();
    };
  }, []);

  const handleAuthenticate = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return alert('Hardware not supported');
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login to Nexil',
      fallbackLabel: 'Use Passcode',
    });
    
    if (result.success) setIsAuthenticated(true);
  };

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>SECURITY & INTELLIGENCE</Text>
      
      <View style={styles.grid}>
        <View style={[styles.card, { width: '100%' }]}>
          <Text style={styles.label}>BIOMETRIC LOCK</Text>
          <TouchableOpacity onPress={handleAuthenticate} style={[styles.authBtn, isAuthenticated && styles.authBtnActive]}>
            <Text style={styles.authBtnText}>{isAuthenticated ? 'AUTHENTICATED' : 'LOCK ACCESS'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>SPEED</Text>
          <Text style={styles.value}>{location?.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : '0.0 km/h'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>APP UPTIME</Text>
          <Text style={styles.value}>{formatUptime(uptime)}</Text>
        </View>

        <View style={[styles.card, { width: '100%' }]}>
          <Text style={styles.label}>COORDINATES</Text>
          <Text style={styles.coordsText}>LAT: {location?.lat.toFixed(6) || '--'}</Text>
          <Text style={styles.coordsText}>LON: {location?.lon.toFixed(6) || '--'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 20, marginTop: 40, marginBottom: 60 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 4, marginBottom: 15, color: '#000' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', backgroundColor: '#F9F9F9', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#F0F0F0' },
  label: { fontSize: 9, fontWeight: '800', color: '#AAA', letterSpacing: 1.5, marginBottom: 8 },
  value: { fontSize: 18, fontWeight: '700', color: '#000' },
  coordsText: { fontSize: 11, fontWeight: '600', color: '#666', marginTop: 4, letterSpacing: 1 },
  authBtn: { backgroundColor: '#EEE', paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
  authBtnActive: { backgroundColor: '#000' },
  authBtnText: { fontSize: 10, fontWeight: '800', color: '#666' },
});
