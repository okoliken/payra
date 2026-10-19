import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Logo, Screen } from '@/components/ui';
import { useGuardedRouter } from '@/lib/navigation';
import { useStore } from '@/store/app-store';

/** Launch screen: yellow brand background, then route to onboarding / auth / app. */
export default function LaunchScreen() {
  const router = useGuardedRouter();
  const { onboarded, signedIn } = useStore();
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());

  // The persisted store loads from AsyncStorage asynchronously; don't route on stale defaults.
  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      if (__DEV__ && process.env.EXPO_PUBLIC_START_ROUTE) return router.replace(process.env.EXPO_PUBLIC_START_ROUTE as never);
      if (signedIn) router.replace('/(tabs)');
      else if (onboarded) router.replace('/(auth)/sign-in');
      else router.replace('/onboarding');
    }, 1100);
    return () => clearTimeout(timer);
  }, [hydrated, onboarded, signedIn, router]);

  return (
    <Screen tone="brand" style={styles.center}>
      <View style={styles.center}>
        <Logo size={56} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
