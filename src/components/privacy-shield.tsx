import { useEffect, useState } from "react";
import { AppState } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { Logo } from "@/components/ui";

/**
 * Banking-app privacy screen: as soon as the app stops being active (swiping up to the app
 * switcher, a notification pulled down, going home) a Brand/Secondary cover with the logo hides
 * balances and transactions, so they never show in the app-switcher snapshot. It appears with no
 * animation (iOS takes the snapshot right away) and fades out when the app is active again.
 */
export function PrivacyShield() {
  const [hidden, setHidden] = useState(AppState.currentState !== "active");

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => setHidden(state !== "active"));
    return () => sub.remove();
  }, []);

  if (!hidden) return null;
  return (
    <Animated.View exiting={FadeOut.duration(220)} style={styles.cover} pointerEvents="none">
      <Logo size={56} onDark />
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  cover: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.brandDark,
  },
}));
