import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Accelerometer } from 'expo-sensors';
import { useTheme } from '@/constants/ThemeContext';

export default function ToolsUtilities() {
  const { accentColor, isDarkMode } = useTheme();
  const [qrText, setQrText] = useState('Nexil');
  const [level, setLevel] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let accelSubscription: any;
    Accelerometer.setUpdateInterval(100);
    accelSubscription = Accelerometer.addListener(data => {
      setLevel({ x: data.x, y: data.y });
    });

    return () => {
      accelSubscription?.remove();
    };
  }, []);

  const themeStyles = {
    card: [styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F9F9F9', borderColor: isDarkMode ? '#333' : '#F0F0F0' }],
    text: { color: isDarkMode ? '#FFF' : '#000' },
    input: [styles.input, { backgroundColor: isDarkMode ? '#222' : '#EEE', color: isDarkMode ? '#FFF' : '#000' }],
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, themeStyles.text]}>TOOLS & UTILITIES</Text>
      
      <View style={styles.grid}>
        <View style={[themeStyles.card, { width: '100%' }]}>
          <Text style={styles.label}>QR GENERATOR</Text>
          <View style={styles.qrRow}>
            <View style={styles.qrWrapper}>
              <QRCode value={qrText} size={80} backgroundColor="transparent" color={isDarkMode ? '#FFF' : '#000'} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <TextInput 
                style={themeStyles.input}
                value={qrText}
                onChangeText={setQrText}
                placeholder="Enter text..."
                placeholderTextColor="#999"
              />
              <Text style={styles.subLabel}>Dynamic QR Generation</Text>
            </View>
          </View>
        </View>

        <View style={[themeStyles.card, { width: '100%' }]}>
          <Text style={styles.label}>SPIRIT LEVEL</Text>
          <View style={styles.levelContainer}>
            <View style={styles.levelBase}>
              <View style={[
                styles.levelBubble, 
                { 
                  left: `${(level.x + 1) * 50}%`, 
                  top: `${(level.y + 1) * 50}%`,
                  backgroundColor: Math.abs(level.x) < 0.05 && Math.abs(level.y) < 0.05 ? accentColor : '#999'
                }
              ]} />
              <View style={styles.centerTarget} />
            </View>
          </View>
          <Text style={[styles.valueSmall, themeStyles.text, { textAlign: 'center', marginTop: 10 }]}>
            X: {level.x.toFixed(2)} Y: {level.y.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 20, marginTop: 40 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 4, marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { padding: 16, borderRadius: 24, borderWidth: 1 },
  label: { fontSize: 9, fontWeight: '800', color: '#AAA', letterSpacing: 1.5, marginBottom: 12 },
  qrRow: { flexDirection: 'row', alignItems: 'center' },
  qrWrapper: { backgroundColor: '#FFF', padding: 10, borderRadius: 12 },
  input: { borderRadius: 12, padding: 10, fontSize: 13, marginBottom: 4 },
  subLabel: { fontSize: 9, color: '#999', fontWeight: '600' },
  levelContainer: { height: 120, alignItems: 'center', justifyContent: 'center' },
  levelBase: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EEE', position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  levelBubble: { width: 20, height: 20, borderRadius: 10, position: 'absolute', marginLeft: -10, marginTop: -10, elevation: 2 },
  centerTarget: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#CCC' },
  valueSmall: { fontSize: 12, fontWeight: '600' }
});
