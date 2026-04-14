import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Magnetometer, LightSensor } from 'expo-sensors';
import { Audio } from 'expo-av';
import { useTheme } from '@/constants/ThemeContext';

export default function EnvironmentalSensors() {
  const { accentColor, isDarkMode } = useTheme();
  const [dbLevel, setDbLevel] = useState(0);
  const [lux, setLux] = useState<number | null>(null);
  const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let recording: Audio.Recording | null = null;
    let magSubscription: any;
    let lightSubscription: any;

    // 1. Sound Level Meter (dB)
    const startMonitoringSound = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.LOW_QUALITY);
        await recording.startAsync();

        recording.setOnRecordingStatusUpdate((status) => {
          if (status.metering !== undefined) {
            // Convert metering (-160 to 0) to a more readable dB-like scale
            const db = Math.max(0, (status.metering + 160) / 2);
            setDbLevel(Math.round(db));
          }
        });
        recording.setProgressUpdateInterval(200);
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    };

    startMonitoringSound();

    // 2. Magnetometer
    Magnetometer.setUpdateInterval(500);
    magSubscription = Magnetometer.addListener(data => {
      setMagData(data);
    });

    // 3. Light Sensor
    LightSensor.addListener(data => {
      if (data && typeof data.illumination === 'number') {
        setLux(data.illumination);
      }
    });

    return () => {
      if (recording) recording.stopAndUnloadAsync();
      magSubscription?.remove();
      lightSubscription?.remove();
    };
  }, []);

  const magIntensity = Math.sqrt(magData.x ** 2 + magData.y ** 2 + magData.z ** 2);

  const themeStyles = {
    card: [styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F9F9F9', borderColor: isDarkMode ? '#333' : '#F0F0F0' }],
    text: { color: isDarkMode ? '#FFF' : '#000' },
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, themeStyles.text]}>ENVIRONMENTAL SENSORS</Text>
      <View style={styles.grid}>
        <View style={themeStyles.card}>
          <Text style={styles.label}>SOUND LEVEL</Text>
          <Text style={[styles.value, themeStyles.text]}>{dbLevel} dB</Text>
          <View style={styles.meterContainer}>
            <View style={[styles.meterFill, { width: `${Math.min(100, dbLevel)}%`, backgroundColor: accentColor }]} />
          </View>
        </View>

        <View style={themeStyles.card}>
          <Text style={styles.label}>LIGHT LEVEL</Text>
          <Text style={[styles.value, themeStyles.text]}>
            {typeof lux === 'number' ? lux.toFixed(0) : '--'} LUX
          </Text>
        </View>

        <View style={[themeStyles.card, { width: '100%' }]}>
          <Text style={styles.label}>MAGNETIC FIELD (METAL)</Text>
          <Text style={[styles.value, themeStyles.text]}>{magIntensity.toFixed(1)} μT</Text>
          <Text style={styles.subLabel}>X: {magData.x.toFixed(0)} Y: {magData.y.toFixed(0)} Z: {magData.z.toFixed(0)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 20, marginTop: 40 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 4, marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', padding: 16, borderRadius: 24, borderWidth: 1 },
  label: { fontSize: 9, fontWeight: '800', color: '#AAA', letterSpacing: 1.5, marginBottom: 8 },
  value: { fontSize: 20, fontWeight: '700' },
  subLabel: { fontSize: 10, color: '#999', marginTop: 4 },
  meterContainer: { width: '100%', height: 4, backgroundColor: '#EEE', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 2 },
});
