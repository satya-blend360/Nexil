import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Battery from 'expo-battery';

export default function BatteryStatus() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryState, setBatteryState] = useState<Battery.BatteryState | null>(null);

  useEffect(() => {
    let subscription: Battery.Subscription;

    const updateBatteryInfo = async () => {
      const level = await Battery.getBatteryLevelAsync();
      const state = await Battery.getBatteryStateAsync();
      setBatteryLevel(level);
      setBatteryState(state);
    };

    updateBatteryInfo();

    // Subscribe to battery level and state changes
    subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      setBatteryLevel(batteryLevel);
    });

    const stateSubscription = Battery.addBatteryStateListener(({ batteryState }) => {
      setBatteryState(batteryState);
    });

    return () => {
      subscription?.remove();
      stateSubscription?.remove();
    };
  }, []);

  const getBatteryPercentage = () => {
    if (batteryLevel === null) return '--';
    return Math.round(batteryLevel * 100);
  };

  const isCharging = batteryState === Battery.BatteryState.CHARGING || 
                    batteryState === Battery.BatteryState.FULL;

  return (
    <View style={styles.container}>
      <Text style={styles.percentage}>{getBatteryPercentage()}%</Text>
      <Text style={styles.label}>{isCharging ? 'CHARGING' : 'BATTERY'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 60,
  },
  percentage: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -1,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
