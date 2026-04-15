import Constants from 'expo-constants';
import * as Network from 'expo-network';
import { useEffect, useState } from 'react';
import { Alert, AppState } from 'react-native';

interface DevConnectionMonitorProps {
    onConnectionLost?: () => void;
    onConnectionRestored?: () => void;
}

export default function DevConnectionMonitor({
    onConnectionLost,
    onConnectionRestored
}: DevConnectionMonitorProps) {
    const [isConnected, setIsConnected] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    // Only run in development mode
    const isDev = Constants.expoConfig?.hostUri;

    const checkConnection = async () => {
        if (!isDev) return;

        try {
            const networkState = await Network.getNetworkStateAsync();

            if (!networkState.isConnected) {
                if (isConnected) {
                    setIsConnected(false);
                    setRetryCount(0);
                    onConnectionLost?.();

                    Alert.alert(
                        'Connection Lost',
                        'Lost connection to development server. Trying to reconnect...',
                        [
                            { text: 'Retry', onPress: () => attemptReconnect() },
                            { text: 'Continue Offline', style: 'cancel' }
                        ]
                    );
                }
                return;
            }

            // Try to ping the development server
            const devServerUrl = `http://${Constants.expoConfig?.hostUri}/status`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await fetch(devServerUrl, {
                    method: 'HEAD',
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.ok && !isConnected) {
                    setIsConnected(true);
                    setRetryCount(0);
                    onConnectionRestored?.();

                    Alert.alert(
                        'Connection Restored',
                        'Successfully reconnected to development server!',
                        [{ text: 'OK' }]
                    );
                } else if (!response.ok && isConnected) {
                    setIsConnected(false);
                    handleConnectionLoss();
                }
            } catch (error) {
                clearTimeout(timeoutId);
                if (isConnected) {
                    setIsConnected(false);
                    handleConnectionLoss();
                }
            }
        } catch (error) {
            console.warn('Connection check failed:', error);
        }
    };

    const handleConnectionLoss = () => {
        onConnectionLost?.();

        if (retryCount < 3) {
            setTimeout(() => {
                setRetryCount(prev => prev + 1);
                checkConnection();
            }, Math.pow(2, retryCount) * 1000); // Exponential backoff
        } else {
            Alert.alert(
                'Connection Issues',
                'Unable to connect to development server. Please check your network and restart the Metro server.',
                [
                    { text: 'Retry', onPress: () => attemptReconnect() },
                    {
                        text: 'Restart Metro',
                        onPress: () => Alert.alert(
                            'Restart Instructions',
                            'Please stop the current Metro server (Ctrl+C) and run:\n\nnpx expo start --dev-client --tunnel\n\nThen scan the QR code again.'
                        )
                    }
                ]
            );
        }
    };

    const attemptReconnect = () => {
        setRetryCount(0);
        checkConnection();
    };

    useEffect(() => {
        if (!isDev) return;

        // Initial check
        checkConnection();

        // Set up periodic checks
        const interval = setInterval(checkConnection, 10000); // Check every 10 seconds

        // Check when app becomes active
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active') {
                checkConnection();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            clearInterval(interval);
            subscription.remove();
        };
    }, [isDev, isConnected, retryCount]);

    // This component doesn't render anything
    return null;
}