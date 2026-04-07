import { Stack } from 'expo-router';
import { ThemeProvider } from '@/constants/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
