import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import RNAndroidNotificationListener from 'react-native-android-notification-listener';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/constants/ThemeContext';

interface Notification {
  id: string;
  app: string;
  title: string;
  text: string;
  time: string;
}

export default function NotificationHub() {
  const { accentColor, isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check if the module exists (it will be null in Expo Go)
  const isModuleAvailable = Platform.OS === 'android' && RNAndroidNotificationListener !== null;

  const checkPermission = async () => {
    if (!isModuleAvailable) return;
    try {
      const status = await RNAndroidNotificationListener.getPermissionStatus();
      setIsAuthorized(status === 'authorized');
    } catch (e) {
      console.warn('Failed to check notification permission:', e);
    }
  };

  const requestPermission = () => {
    if (!isModuleAvailable) return;
    RNAndroidNotificationListener.requestPermission();
  };

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('nexil_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  const clearNotifications = async () => {
    await AsyncStorage.removeItem('nexil_notifications');
    setNotifications([]);
  };

  useEffect(() => {
    if (isModuleAvailable) {
      checkPermission();
    }
    loadNotifications();

    // Check periodically as the Headless Task updates AsyncStorage
    const interval = setInterval(loadNotifications, 3000);
    return () => clearInterval(interval);
  }, [isModuleAvailable]);

  const themeStyles = {
    card: [styles.card, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F9F9F9', borderColor: isDarkMode ? '#333' : '#F0F0F0' }],
    text: { color: isDarkMode ? '#FFF' : '#000' },
  };

  if (!isModuleAvailable) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, themeStyles.text]}>NOTIFICATION HUB</Text>
        <View style={themeStyles.card}>
          <Text style={styles.warningText}>
            {Platform.OS === 'ios' 
              ? 'Notification listening is not supported on iOS due to system privacy restrictions.' 
              : 'This feature requires a standalone APK/Development Build and is not available in Expo Go.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, themeStyles.text]}>NOTIFICATION HUB (ANDROID)</Text>
      
      {!isAuthorized ? (
        <View style={themeStyles.card}>
          <Text style={styles.warningText}>Notification Access is required to read alerts from other apps.</Text>
          <TouchableOpacity 
            onPress={requestPermission} 
            style={[styles.btn, { backgroundColor: accentColor }]}
          >
            <Text style={styles.btnText}>ENABLE ACCESS</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[themeStyles.card, { padding: 0, overflow: 'hidden' }]}>
          <View style={styles.listHeader}>
            <Text style={styles.label}>LATEST ALERTS</Text>
            <TouchableOpacity onPress={clearNotifications}>
              <Text style={[styles.clearText, { color: accentColor }]}>CLEAR ALL</Text>
            </TouchableOpacity>
          </View>

          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications yet.</Text>
            </View>
          ) : (
            notifications.map((notif) => (
              <View key={notif.id} style={[styles.notifItem, { borderBottomColor: isDarkMode ? '#222' : '#EEE' }]}>
                <View style={styles.notifHeader}>
                  <Text style={[styles.appName, { color: accentColor }]}>{notif.app.toUpperCase()}</Text>
                </View>
                <Text style={[styles.notifTitle, themeStyles.text]}>{notif.title}</Text>
                <Text style={styles.notifBody}>{notif.text}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 20, marginTop: 40 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 4, marginBottom: 15 },
  card: { padding: 20, borderRadius: 24, borderWidth: 1 },
  warningText: { fontSize: 13, color: '#666', marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  btn: { paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingBottom: 10 },
  label: { fontSize: 9, fontWeight: '800', color: '#AAA', letterSpacing: 1.5 },
  clearText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 12, fontStyle: 'italic' },
  notifItem: { padding: 16, borderBottomWidth: 1 },
  notifHeader: { marginBottom: 4 },
  appName: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  notifBody: { fontSize: 12, color: '#666', lineHeight: 18 },
});
