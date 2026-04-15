import { ThemeProvider } from '@/constants/ThemeContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
