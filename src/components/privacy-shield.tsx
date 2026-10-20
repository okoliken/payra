import { useEffect, useState } from "react";
import { AppState, View } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeOut } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { Logo } from "@/components/ui";
import { isPromptingBiometrics } from "@/lib/biometrics";

/**
 * Banking-app privacy screen: as soon as the app stops being active (swiping up to the app
 * switcher, a notification pulled down, going home) the screen is blurred under a light
 * Brand/Secondary tint with the logo, so balances never show in the app-switcher snapshot. It
 * appears with no animation (iOS takes the snapshot right away) and fades out on return.
 */
export function PrivacyShield() {
  const [hidden, setHidden] = useState(AppState.currentState !== "active");

  useEffect(() => {
    // Going inactive for our own Face ID prompt is not leaving the app, so it stays unblurred.
    const sub = AppState.addEventListener("change", (state) =>
      setHidden(state === "background" || (state === "inactive" && !isPromptingBiometrics())),
    );
    return () => sub.remove();
  }, []);

  if (!hidden) return null;
  return (
    <Animated.View exiting={FadeOut.duration(220)} style={styles.cover} pointerEvents="none">
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.tint} />
      <Logo size={56} />
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  cover: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
  },
  // A wash of the brand green over the blur, so it reads as Payra rather than a generic blur.
  tint: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.brandDark, opacity: 0.12 },
}));
