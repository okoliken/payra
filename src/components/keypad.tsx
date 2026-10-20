import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components/ui";
import { AppIcon } from "@/components/app-icon";

export type KeypadKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "." | "del";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Figma "Enter PIN" keypad: 3 columns of 114×64 keys, 12 apart, rows 32 apart; digits Heading/H3/Bold,
 * backspace 28pt. `decimal` puts a "." in the empty bottom-left slot (amount entry); `compact`
 * tightens the rows to fit inside a sheet.
 */
export function Keypad({
  onKey,
  decimal = false,
  compact = false,
}: {
  onKey: (k: KeypadKey) => void;
  decimal?: boolean;
  compact?: boolean;
}) {
  const rows: (KeypadKey | null)[][] = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [decimal ? "." : null, "0", "del"],
  ];
  return (
    <View style={[styles.pad, compact && styles.padCompact]}>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((k, c) => (k ? <Key key={k} k={k} onKey={onKey} /> : <View key={`empty-${c}`} style={styles.key} />))}
        </View>
      ))}
    </View>
  );
}

/**
 * A grey disc shows behind the key while it is held, like the iOS passcode pad. It appears
 * instantly and lingers briefly on release, so even a quick tap visibly lands.
 */
function Key({ k, onKey }: { k: KeypadKey; onKey: (k: KeypadKey) => void }) {
  const { theme } = useUnistyles();
  const down = useSharedValue(0);
  const disc = useAnimatedStyle(() => ({ opacity: down.value }));

  return (
    <AnimatedPressable
      accessibilityRole="keyboardkey"
      accessibilityLabel={k === "del" ? "Delete" : k === "." ? "Decimal point" : k}
      style={styles.key}
      onPressIn={() => {
        down.set(1);
        Haptics.selectionAsync().catch(() => {});
        onKey(k);
      }}
      onPressOut={() => down.set(withDelay(60, withTiming(0, { duration: 250 })))}
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
  padCompact: { gap: 8 },
  row: { flexDirection: "row", gap: 12 },
  key: { width: 114, height: 64, alignItems: "center", justifyContent: "center" },
  disc: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.fill.medium,
  },
  digit: { color: theme.palette.black },
}));
