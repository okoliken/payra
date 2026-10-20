import { useCallback, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText, Screen } from "@/components/ui";
import { PayraLoader } from "@/components/payra-loader";
import { PinPad } from "@/components/pin-pad";
import { useGuardedRouter } from "@/lib/navigation";
import { useStore } from "@/store/app-store";

/** How long "loading your account" shows after the PIN, like a real app fetching the balance. */
const LOADING_MS = 1300;

/**
 * Where the app opens once you are set up: Figma "Enter PIN" (338:1352) greeting you by name.
 * After the PIN the Payra loader holds the screen while the account "loads", then Home.
 */
export default function UnlockScreen() {
  const router = useGuardedRouter();
  const { user, signOut } = useStore();
  const [loading, setLoading] = useState(false);

  const onComplete = useCallback(() => setLoading(true), []);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => router.replace("/(tabs)"), LOADING_MS);
    return () => clearTimeout(t);
  }, [loading, router]);

  if (loading) {
    return (
      <Screen>
        <PayraLoader />
      </Screen>
    );
  }

  return (
    <Screen>
      <Animated.View exiting={FadeOut.duration(150)} style={styles.fill}>
        <View style={styles.copy}>
          <AppText variant="h4" weight="semiBold">
            Welcome back, {user.name.split(" ")[0]}
          </AppText>
          <AppText variant="body" tone="secondary">
            Please enter your 6-digits PIN
          </AppText>
        </View>
        <PinPad onComplete={onComplete} />
        <View style={styles.footer}>
          <Pressable hitSlop={8} onPress={() => Haptics.selectionAsync().catch(() => {})}>
            <AppText variant="body" weight="semiBold" style={styles.link}>
              Forgot my PIN
            </AppText>
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => {
              signOut();
              router.replace("/");
            }}
          >
            <AppText variant="body" weight="semiBold" style={styles.link}>
              Log Out
            </AppText>
          </Pressable>
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  fill: { flex: 1 },
  // Figma: title block at y154 (status bar + 88), dots 64 below it.
  copy: { marginTop: 92, marginBottom: 64, gap: 8 },
  // Figma's keypad frame is 328 tall but its last row overflows it; the links sit 30 below that row.
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  link: { color: theme.colors.brandDark },
}));
