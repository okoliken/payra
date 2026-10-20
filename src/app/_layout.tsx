import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUnistyles } from 'react-native-unistyles';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const { theme } = useUnistyles();

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            // Native iOS push/pop with interactive swipe-back; explicit duration keeps Android in step.
            animation: 'slide_from_right',
            animationDuration: 320,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade', animationDuration: 400, gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade', animationDuration: 400, gestureEnabled: false }} />
          <Stack.Screen name="unlock" options={{ animation: 'fade', animationDuration: 300, gestureEnabled: false }} />
          <Stack.Screen name="success" options={{ animation: 'fade', animationDuration: 300, gestureEnabled: false }} />
        </Stack>
    </GestureHandlerRootView>
  );
}
