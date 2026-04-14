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

    return config;
  });
};
