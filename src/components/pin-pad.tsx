import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { Keypad, type KeypadKey } from "@/components/keypad";
import { SHAKE } from "@/lib/motion";

export const PIN_LENGTH = 6;

/**
 * Figma "Enter PIN" dots + keypad. Calls `onComplete` once the sixth digit is in and ignores
 * further keys; any PIN passes in the demo. Deleting on an empty PIN shakes the dots.
 */
export function PinPad({ onComplete, compact = false }: { onComplete: (pin: string) => void; compact?: boolean }) {
  const [pin, setPin] = useState("");
  const shake = useSharedValue(0);
  const complete = pin.length === PIN_LENGTH;

  useEffect(() => {
    if (!complete) return;
    // Let the last dot fill before handing over.
    const t = setTimeout(() => onComplete(pin), 150);
    return () => clearTimeout(t);
  }, [complete, pin, onComplete]);

  const onKey = (k: KeypadKey) => {
    if (complete) return;
    if (k === "del") {
      if (!pin) {
        shake.value = withSequence(...SHAKE.map((x) => withTiming(x, { duration: 40 })));
        return;
      }
      return setPin((p) => p.slice(0, -1));
    }
    setPin((p) => p + k);
  };

  const dotsStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  return (
    <View>
      <Animated.View
        style={[styles.dots, compact && styles.dotsCompact, dotsStyle]}
        accessible
        accessibilityLabel={`PIN, ${pin.length} of ${PIN_LENGTH} digits entered`}
      >
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <Dot key={i} filled={i < pin.length} />
        ))}
      </Animated.View>
      <Keypad onKey={onKey} compact={compact} />
    </View>
  );
}

/** 16pt dot: Text/Quaternary when empty, Brand/Secondary when filled (quick fade). */
function Dot({ filled }: { filled: boolean }) {
  const p = useSharedValue(filled ? 1 : 0);
  useEffect(() => {
    p.value = withTiming(filled ? 1 : 0, { duration: filled ? 120 : 100 });
  }, [filled, p]);
  const fill = useAnimatedStyle(() => ({ opacity: p.value }));
  return (
    <View style={styles.dot}>
      <Animated.View style={[styles.dotFill, fill]} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  // Figma: dots row padded 32 at the sides, keypad 54 below.
  dots: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 32, marginBottom: 54 },
  dotsCompact: { paddingHorizontal: 56, marginBottom: 24 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.textQuaternary },
  dotFill: { flex: 1, borderRadius: 8, backgroundColor: theme.colors.brandDark },
}));
