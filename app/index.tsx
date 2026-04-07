import React from 'react';
import { StyleSheet, Text, View, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import TorchToggle from '@/components/TorchToggle';
import BatteryStatus from '@/components/BatteryStatus';
import DeviceSensors from '@/components/DeviceSensors';
import DisplayAudio from '@/components/DisplayAudio';
import ConnectivityStorage from '@/components/ConnectivityStorage';
import SecurityIntelligence from '@/components/SecurityIntelligence';
import EnvironmentalSensors from '@/components/EnvironmentalSensors';
import ToolsUtilities from '@/components/ToolsUtilities';
import PersonalProductivity from '@/components/PersonalProductivity';
import ThemeCustomizer from '@/components/ThemeCustomizer';
import NotificationHub from '@/components/NotificationHub';
import { useTheme } from '@/constants/ThemeContext';

export default function HomeScreen() {
  const { accentColor, isDarkMode } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.brand, { color: isDarkMode ? '#FFF' : '#000' }]}>NEXIL</Text>
        </View>

        <View style={styles.mainControl}>
          <TorchToggle size={120} onColor={accentColor} />
          <BatteryStatus />
        </View>

        <View style={[styles.divider, { backgroundColor: isDarkMode ? '#222' : '#F0F0F0' }]} />

        {/* Customization */}
        <ThemeCustomizer />

        {/* Section 1: Notifications */}
        <NotificationHub />

        {/* Section 2: Sensors */}
        <Text style={[styles.sectionHeader, { color: isDarkMode ? '#FFF' : '#000' }]}>MOTION & ENVIRONMENT</Text>
        <DeviceSensors />

        {/* Section 3: Environmental Sensors */}
        <EnvironmentalSensors />

        {/* Section 4: Tools & Utilities */}
        <ToolsUtilities />

        {/* Section 5: Productivity */}
        <PersonalProductivity />

        {/* Section 6: Display & Audio */}
        <DisplayAudio />

        {/* Section 7: Connectivity & Storage */}
        <ConnectivityStorage />

        {/* Section 8: Security & Intelligence */}
        <SecurityIntelligence />
        
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  header: {
    marginBottom: 40,
  },
  brand: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 8,
    paddingLeft: 8,
  },
  mainControl: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  divider: {
    width: '80%',
    height: 1,
    marginVertical: 40,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: -20,
    marginTop: 20,
  }
});
