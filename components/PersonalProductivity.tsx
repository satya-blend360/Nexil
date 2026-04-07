import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { DateTime } from 'luxon';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/constants/ThemeContext';

export default function PersonalProductivity() {
  const { accentColor, isDarkMode } = useTheme();
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [note, setNote] = useState('');
  const [clocks, setClocks] = useState([
    { city: 'London', zone: 'Europe/London' },
    { city: 'New York', zone: 'America/New_York' },
    { city: 'Tokyo', zone: 'Asia/Tokyo' },
  ]);

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const themeStyles = {
    card: [styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F9F9F9', borderColor: isDarkMode ? '#333' : '#F0F0F0' }],
    text: { color: isDarkMode ? '#FFF' : '#000' },
    input: [styles.input, { backgroundColor: isDarkMode ? '#222' : '#EEE', color: isDarkMode ? '#FFF' : '#000' }],
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, themeStyles.text]}>PERSONAL PRODUCTIVITY</Text>
      
      <View style={styles.grid}>
        {/* Pomodoro Timer */}
        <View style={themeStyles.card}>
          <Text style={styles.label}>FOCUS TIMER</Text>
          <Text style={[styles.timerValue, themeStyles.text]}>{formatTime(timer)}</Text>
          <TouchableOpacity 
            onPress={() => setIsActive(!isActive)} 
            style={[styles.btn, { backgroundColor: accentColor }]}
          >
            <Text style={styles.btnText}>{isActive ? 'PAUSE' : 'START'}</Text>
          </TouchableOpacity>
        </View>

        {/* Ephemeral Note */}
        <View style={themeStyles.card}>
          <Text style={styles.label}>EPHEMERAL NOTE</Text>
          <TextInput 
            style={themeStyles.input}
            multiline
            placeholder="Quick scratchpad..."
            placeholderTextColor="#999"
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* World Clock */}
        <View style={[themeStyles.card, { width: '100%' }]}>
          <Text style={styles.label}>WORLD CLOCK</Text>
          {clocks.map(clock => (
            <View key={clock.city} style={styles.clockRow}>
              <Text style={[styles.clockCity, themeStyles.text]}>{clock.city}</Text>
              <Text style={[styles.clockTime, { color: accentColor }]}>
                {DateTime.now().setZone(clock.zone).toFormat('HH:mm')}
              </Text>
            </View>
          ))}
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
  label: { fontSize: 9, fontWeight: '800', color: '#AAA', letterSpacing: 1.5, marginBottom: 12 },
  timerValue: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  btn: { paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  input: { flex: 1, borderRadius: 12, padding: 8, fontSize: 12, textAlignVertical: 'top', minHeight: 60 },
  clockRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  clockCity: { fontSize: 13, fontWeight: '600' },
  clockTime: { fontSize: 13, fontWeight: '700' }
});
