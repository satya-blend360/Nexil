const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidNotificationListener(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // 1. Add tools namespace if it doesn't exist
    if (!androidManifest.$['xmlns:tools']) {
      androidManifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // 2. Fix the allowBackup conflict
    const mainApplication = androidManifest.application[0];
    mainApplication.$['android:allowBackup'] = 'true';
    mainApplication.$['tools:replace'] = 'android:allowBackup';

    // 3. Add the required service to the <application> tag
    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    const serviceName = 'com.leandrosimoes.rn.android.notification.listener.NotificationListener';

    // Check if the service already exists to avoid duplicates
    const hasService = mainApplication.service.some(
      (s) => s.$['android:name'] === serviceName
    );

    if (!hasService) {
      mainApplication.service.push({
        $: {
          'android:name': serviceName,
          'android:label': '@string/app_name',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: { 'android:name': 'android.service.notification.NotificationListenerService' },
              },
            ],
          },
        ],
      });
    }

    // 4. Add foreground service types for 24/7 operation
    // Find the location foreground service and add type
    const locationServiceName = 'expo.modules.location.services.LocationTaskService';
    const hasLocationService = mainApplication.service.some(
      (s) => s.$['android:name'] === locationServiceName
    );

    if (!hasLocationService) {
      mainApplication.service.push({
        $: {
          'android:name': locationServiceName,
          'android:foregroundServiceType': 'location',
          'android:exported': 'false',
        },
      });
    }

    // 5. Add boot receiver for auto-start on device boot
    if (!mainApplication.receiver) {
      mainApplication.receiver = [];
    }

    const bootReceiverName = 'expo.modules.taskManager.TaskBroadcastReceiver';
    const hasBootReceiver = mainApplication.receiver.some(
      (r) => r.$['android:name'] === bootReceiverName
    );

    if (!hasBootReceiver) {
      mainApplication.receiver.push({
        $: {
          'android:name': bootReceiverName,
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
              { $: { 'android:name': 'android.intent.action.QUICKBOOT_POWERON' } },
            ],
          },
        ],
      });
    }

    return config;
  });
};
