import { useTheme } from '@/constants/ThemeContext';
import BackgroundService from '@/services/BackgroundService';
import * as IntentLauncher from 'expo-intent-launcher';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface BackgroundState {
    lastUpdate: string;
    batteryLevel: number;
    isCharging: boolean;
    location: { lat: number; lon: number } | null;
    runCount: number;
}

export default function AlwaysOnMode() {
    const { accentColor, isDarkMode } = useTheme();
    const [isEnabled, setIsEnabled] = useState(false);
    const [status, setStatus] = useState<{
        backgroundFetch: string;
        backgroundLocation: boolean;
        lastState: BackgroundState | null;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check status on mount
    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const currentStatus = await BackgroundService.getStatus();
            setStatus(currentStatus);
            setIsEnabled(currentStatus.isRunning || currentStatus.backgroundLocation);
        } catch (error) {
            console.error('Failed to check status:', error);
        }
    };

    const toggleAlwaysOn = async (value: boolean) => {
        setIsLoading(true);
        try {
            if (value) {
                const result = await BackgroundService.startAll();
                if (result.success) {
                    setIsEnabled(true);
                    Alert.alert('24/7 Mode Enabled', result.message);
                } else {
                    Alert.alert('Permission Required', result.message, [
                        { text: 'Open Settings', onPress: openBatterySettings },
                        { text: 'Cancel', style: 'cancel' }
                    ]);
                }
            } else {
                await BackgroundService.stopAll();
                setIsEnabled(false);
                Alert.alert('24/7 Mode Disabled', 'Background services have been stopped.');
            }
            await checkStatus();
        } catch (error) {
            Alert.alert('Error', String(error));
        } finally {
            setIsLoading(false);
        }
    };

    const openBatterySettings = async () => {
        if (Platform.OS === 'android') {
            try {
                await IntentLauncher.startActivityAsync(
                    IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
                );
            } catch {
                // Fallback to app settings
                await Linking.openSettings();
            }
        } else {
            await Linking.openSettings();
        }
    };

    const formatLastUpdate = (dateString: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    const themeStyles = {
        card: [styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F9F9F9', borderColor: isDarkMode ? '#333' : '#F0F0F0' }],
        text: { color: isDarkMode ? '#FFF' : '#000' },
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, themeStyles.text]}>24/7 ALWAYS-ON MODE</Text>

            <View style={[themeStyles.card, { width: '100%' }]}>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: accentColor }]}>ALWAYS RUNNING</Text>
                        <Text style={[styles.description, { color: isDarkMode ? '#888' : '#666' }]}>
                            Keep Nexil active in background 24/7
                        </Text>
                    </View>
                    <Switch
                        value={isEnabled}
                        onValueChange={toggleAlwaysOn}
                        disabled={isLoading}
                        trackColor={{ false: '#767577', true: accentColor }}
                        thumbColor={isEnabled ? '#FFF' : '#f4f3f4'}
                    />
                </View>

                {status && (
                    <View style={styles.statusContainer}>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Background Fetch:</Text>
                            <Text style={[styles.statusValue, { color: status.backgroundFetch === 'Available' ? '#4CAF50' : '#F44336' }]}>
                                {status.backgroundFetch}
                            </Text>
                        </View>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Location Service:</Text>
                            <Text style={[styles.statusValue, { color: status.backgroundLocation ? '#4CAF50' : '#F44336' }]}>
                                {status.backgroundLocation ? 'Active' : 'Inactive'}
                            </Text>
                        </View>
                        {status.lastState && (
                            <>
                                <View style={styles.statusRow}>
                                    <Text style={styles.statusLabel}>Last Update:</Text>
                                    <Text style={styles.statusValue}>{formatLastUpdate(status.lastState.lastUpdate)}</Text>
                                </View>
                                <View style={styles.statusRow}>
                                    <Text style={styles.statusLabel}>Background Runs:</Text>
                                    <Text style={styles.statusValue}>{status.lastState.runCount}</Text>
                                </View>
                            </>
                        )}
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.settingsButton, { borderColor: accentColor }]}
                    onPress={openBatterySettings}
                >
                    <Text style={[styles.settingsButtonText, { color: accentColor }]}>
                        DISABLE BATTERY OPTIMIZATION
                    </Text>
                </TouchableOpacity>

                <Text style={[styles.hint, { color: isDarkMode ? '#666' : '#999' }]}>
                    For best results, disable battery optimization for Nexil in your phone settings.
                    This allows the app to run continuously without being killed by the system.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%', paddingHorizontal: 20, marginTop: 40 },
    sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 4, marginBottom: 15 },
    card: { padding: 20, borderRadius: 24, borderWidth: 1 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    label: { fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
    description: { fontSize: 12 },
    statusContainer: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#333' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    statusLabel: { fontSize: 11, color: '#888', fontWeight: '600' },
    statusValue: { fontSize: 11, fontWeight: '700', color: '#FFF' },
    settingsButton: {
        marginTop: 20,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center'
    },
    settingsButtonText: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },
    hint: { fontSize: 10, marginTop: 16, lineHeight: 16, textAlign: 'center' },
});
