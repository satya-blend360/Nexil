import * as Brightness from 'expo-brightness';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function DisplayAudio() {
  const [brightness, setBrightness] = useState(0);
  const [isKeepAwake, setIsKeepAwake] = useState(false);

  // Keep Awake logic - using async functions instead of conditional hook
  useEffect(() => {
    if (isKeepAwake) {
      activateKeepAwakeAsync('nexil-keep-awake').catch(console.warn);
    } else {
      deactivateKeepAwake('nexil-keep-awake');
    }

    return () => {
      deactivateKeepAwake('nexil-keep-awake');
    };
  }, [isKeepAwake]);

  useEffect(() => {
    (async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        const currentBrightness = await Brightness.getBrightnessAsync();
        setBrightness(currentBrightness);
      }
    })();
  }, []);

  const changeBrightness = async (value: number) => {
    const { status } = await Brightness.requestPermissionsAsync();
    if (status === 'granted') {
      await Brightness.setBrightnessAsync(value);
      setBrightness(value);
    }
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
    if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>DISPLAY & AUDIO</Text>

      <View style={styles.card}>
        <Text style={styles.label}>SCREEN BRIGHTNESS</Text>
        <View style={styles.sliderContainer}>
          <TouchableOpacity onPress={() => changeBrightness(Math.max(0, brightness - 0.2))} style={styles.adjustBtn}>
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${brightness * 100}%` }]} />
          </View>
          <TouchableOpacity onPress={() => changeBrightness(Math.min(1, brightness + 0.2))} style={styles.adjustBtn}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.miniCard, { flex: 1 }]}>
          <Text style={styles.label}>KEEP AWAKE</Text>
          <Switch
            value={isKeepAwake}
            onValueChange={setIsKeepAwake}
            trackColor={{ false: '#F0F0F0', true: '#000' }}
          />
        </View>

        <View style={[styles.miniCard, { flex: 2 }]}>
          <Text style={styles.label}>HAPTIC TEST</Text>
          <View style={styles.hapticRow}>
            <TouchableOpacity onPress={() => triggerHaptic('light')} style={styles.dotBtn} />
            <TouchableOpacity onPress={() => triggerHaptic('medium')} style={[styles.dotBtn, { width: 12, height: 12 }]} />
            <TouchableOpacity onPress={() => triggerHaptic('heavy')} style={[styles.dotBtn, { width: 16, height: 16 }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 20, marginTop: 30 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 4, marginBottom: 15, color: '#000' },
  card: { backgroundColor: '#F9F9F9', padding: 20, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  row: { flexDirection: 'row', gap: 12 },
  miniCard: { backgroundColor: '#F9F9F9', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10, fontWeight: '800', color: '#AAA', letterSpacing: 1.5, marginBottom: 10 },
  sliderContainer: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  adjustBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEE', alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 20, fontWeight: '600' },
  progressBar: { flex: 1, height: 6, backgroundColor: '#EEE', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#000' },
  hapticRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  dotBtn: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#000' },
});
