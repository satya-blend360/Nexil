import { AppRegistry } from 'react-native';
import RNAndroidNotificationListener, { 
  RNAndroidNotificationListenerHeadlessJsName 
} from 'react-native-android-notification-listener';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'expo-router/entry';

// This function will run in the background
const headlessNotificationListener = async ({ notification }) => {
  if (notification) {
    try {
      const data = JSON.parse(notification);
      const stored = await AsyncStorage.getItem('nexil_notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      
      // Add new notification to the top, keep only last 50
      const updated = [{ ...data, id: Date.now().toString() }, ...notifications].slice(0, 50);
      await AsyncStorage.setItem('nexil_notifications', JSON.stringify(updated));
      
      console.log('NEXIL_NOTIFICATION_STORED:', data.app);
    } catch (e) {
      console.error('Failed to store notification:', e);
    }
  }
};

// Register the background task
AppRegistry.registerHeadlessTask(
  RNAndroidNotificationListenerHeadlessJsName,
  () => headlessNotificationListener
);
