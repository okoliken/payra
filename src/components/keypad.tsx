import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components/ui";
import { AppIcon } from "@/components/app-icon";

export type KeypadKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "." | "del";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Figma "Enter PIN" keypad: 3 columns of 114×64 keys, 12 apart, rows 32 apart; digits Heading/H3/Bold,
 * backspace 28pt. `decimal` puts a "." in the empty bottom-left slot (amount entry).
 */
export function Keypad({ onKey, decimal = false }: { onKey: (k: KeypadKey) => void; decimal?: boolean }) {
  const rows: (KeypadKey | null)[][] = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [decimal ? "." : null, "0", "del"],
  ];
  return (
    <View style={styles.pad}>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((k, c) => (k ? <Key key={k} k={k} onKey={onKey} /> : <View key={`empty-${c}`} style={styles.key} />))}
        </View>
      ))}
    </View>
  );
}

/** A soft disc fades in behind the key while it is held, like the iOS passcode pad. */
function Key({ k, onKey }: { k: KeypadKey; onKey: (k: KeypadKey) => void }) {
  const { theme } = useUnistyles();
  const down = useSharedValue(0);
  const disc = useAnimatedStyle(() => ({ opacity: down.value }));

  return (
    <AnimatedPressable
      style={styles.key}
      onPressIn={() => {
        down.set(withTiming(1, { duration: 60 }));
        Haptics.selectionAsync().catch(() => {});
        onKey(k);
      }}
      onPressOut={() => down.set(withTiming(0, { duration: 220 }))}
    >
      <Animated.View style={[styles.disc, disc]} />
      {k === "del" ? (
        <AppIcon name="backspace" size={28} color={theme.colors.text} />
      ) : (
        <AppText variant="h3" weight="bold" style={styles.digit}>
          {k}
        </AppText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  pad: { gap: 32 },
  row: { flexDirection: "row", gap: 12 },
  key: { width: 114, height: 64, alignItems: "center", justifyContent: "center" },
  disc: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surfaceMuted,
  },
  digit: { color: theme.palette.black },
}));
