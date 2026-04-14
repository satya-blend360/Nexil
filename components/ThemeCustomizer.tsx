import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';

export default function ThemeCustomizer() {
  const { accentColor, setAccentColor, isDarkMode, toggleDarkMode } = useTheme();

  const colors: any[] = [
    { name: 'Classic', value: '#000000' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Purple', value: '#8B5CF6' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>CUSTOMIZATION</Text>
      
      <View style={[styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F9F9F9', borderColor: isDarkMode ? '#333' : '#F0F0F0' }]}>
        <View style={styles.row}>
          <Text style={styles.label}>DARK MODE OVERRIDE</Text>
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#EEE', true: accentColor }}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>ACCENT THEME</Text>
        <View style={styles.colorGrid}>
          {colors.map(color => (
            <TouchableOpacity 
              key={color.value}
              onPress={() => setAccentColor(color.value)}
              style={[
                styles.colorCircle, 
                { backgroundColor: color.value },
                accentColor === color.value && styles.activeColor
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 20, marginTop: 40, marginBottom: 40 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 4, marginBottom: 15 },
  card: { padding: 20, borderRadius: 24, borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 9, fontWeight: '800', color: '#AAA', letterSpacing: 1.5 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  colorGrid: { flexDirection: 'row', gap: 12, marginTop: 12 },
  colorCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  activeColor: { borderColor: '#CCC', transform: [{ scale: 1.1 }] }
});
