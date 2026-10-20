import { useEffect, useSyncExternalStore } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Logo, Screen } from '@/components/ui';
import { useGuardedRouter } from '@/lib/navigation';
import { useStore } from '@/store/app-store';
import { DEV_ROUTE } from '@/dev-route';

/** Launch screen: yellow brand background, then route to onboarding / auth / app. */
export default function LaunchScreen() {
  const router = useGuardedRouter();
  const signedIn = useStore((s) => s.signedIn);
  // The persisted store loads from AsyncStorage asynchronously; don't route on stale defaults.
  const hydrated = useSyncExternalStore(useStore.persist.onFinishHydration, useStore.persist.hasHydrated);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      if (__DEV__ && DEV_ROUTE) {
        useStore.getState().signIn();
        return router.replace(DEV_ROUTE as never);
      }
      router.replace(signedIn ? '/unlock' : '/onboarding');
    }, 1100);
    return () => clearTimeout(timer);
  }, [hydrated, signedIn, router]);

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
