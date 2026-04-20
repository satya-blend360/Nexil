import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_FETCH_TASK = 'nexil-background-fetch';
const BACKGROUND_LOCATION_TASK = 'nexil-background-location';

// Data structure for background state
interface BackgroundState {
    lastUpdate: string;
    batteryLevel: number;
    isCharging: boolean;
    location: { lat: number; lon: number } | null;
    runCount: number;
}

// Define the background fetch task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        const now = new Date().toISOString();
        console.log(`[Nexil Background] Task executed at ${now}`);

        // Get battery status
        const batteryLevel = await Battery.getBatteryLevelAsync();
        const batteryState = await Battery.getBatteryStateAsync();
        const isCharging = batteryState === Battery.BatteryState.CHARGING;

        // Update background state
        const existingState = await AsyncStorage.getItem('nexil_background_state');
        const state: BackgroundState = existingState
            ? JSON.parse(existingState)
            : { lastUpdate: '', batteryLevel: 0, isCharging: false, location: null, runCount: 0 };

        state.lastUpdate = now;
        state.batteryLevel = Math.round(batteryLevel * 100);
        state.isCharging = isCharging;
        state.runCount += 1;

        await AsyncStorage.setItem('nexil_background_state', JSON.stringify(state));

        // Log status
        console.log(`[Nexil Background] Battery: ${state.batteryLevel}%, Charging: ${isCharging}, Run #${state.runCount}`);

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.error('[Nexil Background] Error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// Define the background location task (keeps app alive)
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error('[Nexil Location] Error:', error);
        return;
    }

    if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        const location = locations[0];

        if (location) {
            console.log(`[Nexil Location] ${location.coords.latitude}, ${location.coords.longitude}`);

            // Store location for background state
            const existingState = await AsyncStorage.getItem('nexil_background_state');
            if (existingState) {
                const state: BackgroundState = JSON.parse(existingState);
                state.location = { lat: location.coords.latitude, lon: location.coords.longitude };
                await AsyncStorage.setItem('nexil_background_state', JSON.stringify(state));
            }
        }
    }
});

// Service class for managing 24/7 operation
class BackgroundService {
    private static instance: BackgroundService;
    private isRunning: boolean = false;

    private constructor() { }

    public static getInstance(): BackgroundService {
        if (!BackgroundService.instance) {
            BackgroundService.instance = new BackgroundService();
        }
        return BackgroundService.instance;
    }

    // Start all background services
    public async startAll(): Promise<{ success: boolean; message: string }> {
        try {
            const results = await Promise.all([
                this.startBackgroundFetch(),
                this.startBackgroundLocation(),
            ]);

            const allSuccess = results.every(r => r.success);
            this.isRunning = allSuccess;

            return {
                success: allSuccess,
                message: allSuccess
                    ? 'Nexil is now running 24/7 in the background!'
                    : 'Some background services failed to start. Check permissions.'
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to start background services: ${error}`
            };
        }
    }

    // Start background fetch (periodic tasks)
    private async startBackgroundFetch(): Promise<{ success: boolean; error?: string }> {
        try {
            const status = await BackgroundFetch.getStatusAsync();

            if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
                return { success: false, error: 'Background fetch permission denied' };
            }

            if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
                return { success: false, error: 'Background fetch is restricted' };
            }

            // Check if already registered
            const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);

            if (!isRegistered) {
                await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
                    minimumInterval: 60, // 1 minute minimum (OS may delay this)
                    stopOnTerminate: false, // Keep running after app close
                    startOnBoot: true, // Start when device boots
                });
            }

            console.log('[Nexil] Background fetch registered');
            return { success: true };
        } catch (error) {
            console.error('[Nexil] Background fetch error:', error);
            return { success: false, error: String(error) };
        }
    }

    // Start background location (keeps app alive constantly)
    private async startBackgroundLocation(): Promise<{ success: boolean; error?: string }> {
        try {
            // Request permissions
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
            if (foregroundStatus !== 'granted') {
                return { success: false, error: 'Foreground location permission denied' };
            }

            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
            if (backgroundStatus !== 'granted') {
                return { success: false, error: 'Background location permission denied' };
            }

            // Check if already running
            const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);

            if (!isRunning) {
                await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
                    accuracy: Location.Accuracy.Balanced,
                    timeInterval: 60000, // Update every minute
                    distanceInterval: 100, // Or every 100 meters
                    deferredUpdatesInterval: 60000,
                    deferredUpdatesDistance: 100,
                    showsBackgroundLocationIndicator: true,
                    foregroundService: {
                        notificationTitle: 'Nexil Active',
                        notificationBody: 'Your AI companion is running in the background',
                        notificationColor: '#00FFFF',
                    },
                });
            }

            console.log('[Nexil] Background location started');
            return { success: true };
        } catch (error) {
            console.error('[Nexil] Background location error:', error);
            return { success: false, error: String(error) };
        }
    }

    // Stop all background services
    public async stopAll(): Promise<void> {
        try {
            const isFetchRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
            if (isFetchRegistered) {
                await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
            }

            const isLocationRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
            if (isLocationRunning) {
                await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
            }

            this.isRunning = false;
            console.log('[Nexil] All background services stopped');
        } catch (error) {
            console.error('[Nexil] Error stopping services:', error);
        }
    }

    // Get current status
    public async getStatus(): Promise<{
        isRunning: boolean;
        backgroundFetch: string;
        backgroundLocation: boolean;
        lastState: BackgroundState | null;
    }> {
        const fetchStatus = await BackgroundFetch.getStatusAsync();
        const locationRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => false);
        const stateJson = await AsyncStorage.getItem('nexil_background_state');
        const lastState = stateJson ? JSON.parse(stateJson) : null;

        const statusMap: Record<number, string> = {
            [BackgroundFetch.BackgroundFetchStatus.Denied]: 'Denied',
            [BackgroundFetch.BackgroundFetchStatus.Restricted]: 'Restricted',
            [BackgroundFetch.BackgroundFetchStatus.Available]: 'Available',
        };

        return {
            isRunning: this.isRunning,
            backgroundFetch: statusMap[fetchStatus] || 'Unknown',
            backgroundLocation: locationRunning,
            lastState,
        };
    }

    // Check if services are running
    public isServiceRunning(): boolean {
        return this.isRunning;
    }
}

export default BackgroundService.getInstance();
export { BACKGROUND_FETCH_TASK, BACKGROUND_LOCATION_TASK };

