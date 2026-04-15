import AIController from '@/services/AIController';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Accelerometer, Barometer, DeviceMotion, Pedometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function DeviceSensors() {
  const [stepCount, setStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [orientation, setOrientation] = useState('unknown');
  const [altitude, setAltitude] = useState<number | null>(null);
  const [pressure, setPressure] = useState<number | null>(null);
  const [lastShake, setLastShake] = useState<number>(0);

  useEffect(() => {
    let pedometerSubscription: any;
    let motionSubscription: any;
    let barometerSubscription: any;
    let accelSubscription: any;

    // 1. Pedometer
    Pedometer.isAvailableAsync().then(
      result => setIsPedometerAvailable(String(result)),
      error => setIsPedometerAvailable('Could not get isPedometerAvailable: ' + error)
    );

    pedometerSubscription = Pedometer.watchStepCount(result => {
      setStepCount(result.steps);
      AIController.updateSteps(result.steps);
    });

    // 2. Orientation (Device Motion)
    DeviceMotion.setUpdateInterval(500);
    motionSubscription = DeviceMotion.addListener(data => {
      const { rotation } = data;
      if (rotation) {
        // Simple orientation logic
        const beta = Math.abs(rotation.beta);
        let status = 'Tilted/Upright';
        if (beta < 0.2) status = 'Flat (Face Up)';
        else if (beta > 2.8) status = 'Flat (Face Down)';

        setOrientation(status);
        AIController.updateOrientation(status);
      }
    });

    // 3. Altitude & Barometer
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setAltitude(loc.coords.altitude);
      }

      const isBarometerAvailable = await Barometer.isAvailableAsync();
      if (isBarometerAvailable) {
        barometerSubscription = Barometer.addListener(data => {
          setPressure(data.pressure);
        });
      }
    })();

    // 4. Shake Detection
    Accelerometer.setUpdateInterval(100);
    accelSubscription = Accelerometer.addListener(data => {
      const totalForce = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);
      if (totalForce > 2.8) { // Slightly higher threshold for AI trigger
        const now = Date.now();
        if (now - lastShake > 3000) { // Throttle
          setLastShake(now);
          AIController.triggerShake();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    });

    return () => {
      pedometerSubscription?.remove();
      motionSubscription?.remove();
      barometerSubscription?.remove();
      accelSubscription?.remove();
    };
  }, [lastShake]);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>STEPS</Text>
          <Text style={styles.value}>{stepCount}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>ORIENTATION</Text>
          <Text style={styles.valueSmall}>{orientation}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>ALTITUDE</Text>
          <Text style={styles.value}>{altitude ? `${altitude.toFixed(1)}m` : '--'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>SHAKE STATUS</Text>
          <Text style={styles.valueSmall}>
            {Date.now() - lastShake < 2000 ? 'DETECTED!' : 'IDLE'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  card: {
    width: '46%',
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#AAA',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  valueSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
