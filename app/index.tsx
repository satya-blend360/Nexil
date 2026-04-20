import AICommandInput from '@/components/AICommandInput';
import AIFriendOrb from '@/components/AIFriendOrb';
import AlwaysOnMode from '@/components/AlwaysOnMode';
import BatteryStatus from '@/components/BatteryStatus';
import ConnectivityStorage from '@/components/ConnectivityStorage';
import DevConnectionMonitor from '@/components/DevConnectionMonitor';
import DeviceSensors from '@/components/DeviceSensors';
import DisplayAudio from '@/components/DisplayAudio';
import EnvironmentalSensors from '@/components/EnvironmentalSensors';
import NotificationHub from '@/components/NotificationHub';
import PersonalProductivity from '@/components/PersonalProductivity';
import SecurityIntelligence from '@/components/SecurityIntelligence';
import ThemeCustomizer from '@/components/ThemeCustomizer';
import ToolsUtilities from '@/components/ToolsUtilities';
import TorchToggle from '@/components/TorchToggle';
import { useTheme } from '@/constants/ThemeContext';
import { useAI } from '@/hooks/useAI';
import AIController from '@/services/AIController';
import { CameraView } from 'expo-camera';
import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { accentColor, isDarkMode } = useTheme();
  const { emotion, isSpeaking, interact, sendMessage, lastMessage, personality } = useAI();
  const [isScanning, setIsScanning] = React.useState(false);

  React.useEffect(() => {
    return AIController.onScanRequest(setIsScanning);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Development Connection Monitor - only active in dev mode */}
      <DevConnectionMonitor
        onConnectionLost={() => console.log('Dev connection lost')}
        onConnectionRestored={() => console.log('Dev connection restored')}
      />

      {isScanning && (
        <View style={styles.scannerOverlay}>
          <CameraView style={styles.camera} facing="back">
            <View style={styles.scannerLine} />
            <Text style={styles.scannerText}>SOVEREIGN VISION ACTIVE</Text>
          </CameraView>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.brand, { color: isDarkMode ? '#FFF' : '#000' }]}>NEXIL</Text>
        </View>

        <View style={styles.mainControl}>
          <AIFriendOrb
            emotion={emotion}
            isSpeaking={isSpeaking}
            onPress={interact}
          />

          <AICommandInput
            onSend={sendMessage}
            isSpeaking={isSpeaking}
            accentColor={accentColor}
          />

          {lastMessage && (
            <Text style={[styles.lastMessage, { color: isDarkMode ? '#888' : '#666' }]}>
              "{lastMessage}"
            </Text>
          )}

          <View style={styles.personalityStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CORE ENERGY</Text>
              <View style={styles.statBarBg}>
                <View style={[styles.statBarFill, { width: `${personality.socialEnergy}%`, backgroundColor: accentColor }]} />
              </View>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>USER LOYALTY</Text>
              <View style={styles.statBarBg}>
                <View style={[styles.statBarFill, { width: `${personality.loyalty}%`, backgroundColor: '#00FF00' }]} />
              </View>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>KNOWLEDGE LEVEL</Text>
              <View style={styles.statBarBg}>
                <View style={[styles.statBarFill, { width: `${personality.knowledgeLevel}%`, backgroundColor: '#A020F0' }]} />
              </View>
            </View>
          </View>

          <View style={styles.topControlRow}>
            <TorchToggle size={80} onColor={accentColor} />
            <BatteryStatus />
          </View>
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

        {/* Section 9: 24/7 Always-On Mode */}
        <AlwaysOnMode />

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
    width: '100%',
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginTop: 20,
  },
  lastMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  personalityStats: {
    width: '80%',
    padding: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    marginBottom: 20,
    gap: 10,
  },
  statItem: {
    gap: 5,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#888',
  },
  statBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 2,
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
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#00FFFF',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  scannerText: {
    position: 'absolute',
    bottom: 50,
    color: '#00FFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
  }
});
