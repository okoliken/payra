import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { Easing, FadeOut, ZoomIn } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type Tap = { id: number; x: number; y: number };
const listeners = new Set<(t: Tap) => void>();
let seq = 0;

/** Demo tour: shows a touch ripple at a point (in window points), like a finger landing there. */
export function showTap(x: number, y: number) {
  const tap = { id: ++seq, x, y };
  listeners.forEach((l) => l(tap));
}

/** Mounted once at the root during the demo; draws every `showTap` and lets touches through. */
export function DemoTaps() {
  const [taps, setTaps] = useState<Tap[]>([]);
  useEffect(() => {
    const on = (t: Tap) => {
      setTaps((all) => [...all, t]);
      setTimeout(() => setTaps((all) => all.filter((x) => x.id !== t.id)), 520);
    };
    listeners.add(on);
    return () => {
      listeners.delete(on);
    };
  }, []);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {taps.map((t) => (
        <Animated.View
          key={t.id}
          entering={ZoomIn.duration(260).easing(Easing.out(Easing.cubic)).withInitialValues({ transform: [{ scale: 0.4 }] })}
          exiting={FadeOut.duration(220)}
          style={[styles.ripple, { left: t.x - 26, top: t.y - 26 }]}
        >
          <View style={styles.dot} />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  ripple: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 70, 71, 0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(11, 70, 71, 0.45)",
  },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.brandDark, opacity: 0.85 },
}));
