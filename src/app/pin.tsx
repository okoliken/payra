import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText, Screen } from "@/components/ui";
import { Keypad, type KeypadKey } from "@/components/keypad";
import { useGuardedRouter } from "@/lib/navigation";
import { findContact } from "@/data/mock";
import { useStore } from "@/store/app-store";

const LENGTH = 6;

/** Figma "Enter PIN" (338:1352), used here to authorise the transfer. Any 6 digits pass. */
export default function EnterPinScreen() {
  const router = useGuardedRouter();
  const { contactId, amount, mode } = useLocalSearchParams<{ contactId?: string; amount: string; mode?: "topup" }>();
  const { addTransaction, signOut } = useStore();
  const [pin, setPin] = useState("");
  const shake = useSharedValue(0);

  useEffect(() => {
    if (pin.length < LENGTH) return;
    const value = Number(amount) || 0;
    const shown = `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    // Let the last dot land before moving on.
    const t = setTimeout(() => {
      if (mode === "topup") {
        addTransaction({ title: "Wallet Top-up", kind: "topup", amount: value, category: "My Wallet" });
        router.replace({ pathname: "/success", params: { title: "Top Up Successful!", body: `You added ${shown} to your wallet` } });
      } else {
        const contact = findContact(contactId);
        addTransaction({ title: "Transfer", kind: "sent", amount: -value, category: contact.name });
        router.replace({ pathname: "/success", params: { title: "Transfer Successful!", body: `You sent ${shown} to ${contact.name}` } });
      }
    }, 280);
    return () => clearTimeout(t);
  }, [pin, contactId, amount, mode, addTransaction, router]);

  const onKey = (k: KeypadKey) => {
    if (k === "del") {
      if (!pin) {
        shake.value = withSequence(
          ...[-8, 8, -6, 6, -3, 0].map((x) => withTiming(x, { duration: 45 })),
        );
        return;
      }
      return setPin((p) => p.slice(0, -1));
    }
    setPin((p) => (p.length < LENGTH ? p + k : p));
  };

  const dotsStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  return (
    <Screen>
      <View style={styles.copy}>
        <AppText variant="h4" weight="semiBold">
          Enter your PIN
        </AppText>
        <AppText variant="body" tone="secondary">
          Please enter your 6-digits PIN
        </AppText>
      </View>
      <Animated.View style={[styles.dots, dotsStyle]}>
        {Array.from({ length: LENGTH }, (_, i) => (
          <Dot key={i} filled={i < pin.length} />
        ))}
      </Animated.View>
      <Keypad onKey={onKey} />
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
    </Screen>
  );
}

/** 16pt dot: Text/Quaternary when empty, Brand/Secondary when filled; pops as it fills. */
function Dot({ filled }: { filled: boolean }) {
  const p = useSharedValue(filled ? 1 : 0);
  useEffect(() => {
    p.value = filled ? withSpring(1, { damping: 9, stiffness: 320 }) : withTiming(0, { duration: 120 });
  }, [filled, p]);
  const fill = useAnimatedStyle(() => ({ opacity: Math.min(p.value, 1), transform: [{ scale: 0.4 + 0.6 * p.value }] }));
  return (
    <View style={styles.dot}>
      <Animated.View style={[styles.dotFill, fill]} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  // Figma: title block at y154 (status bar + 88), dots 64 below it, keypad 54 below the dots.
  copy: { marginTop: 92, gap: 8 },
  dots: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    marginTop: 64,
    marginBottom: 54,
  },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.textQuaternary },
  dotFill: { flex: 1, borderRadius: 8, backgroundColor: theme.colors.brandDark },
  // Figma's keypad frame is 328 tall but its last row overflows it; the links sit 30 below that row.
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
  link: { color: theme.colors.brandDark },
}));
