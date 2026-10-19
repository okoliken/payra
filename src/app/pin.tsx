import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, {
  Easing,
  FadeIn,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
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
/** How long the fake network call takes, so the sending state is actually seen. */
const SENDING_MS = 1800;

/**
 * Figma "Enter PIN" (338:1352), used here to authorise the transfer. Any 6 digits pass. Once the
 * last digit lands the dots become a wave loader, the keypad fades out and the copy says what is
 * happening; the result screen follows when the (simulated) request completes.
 */
export default function EnterPinScreen() {
  const router = useGuardedRouter();
  const { contactId, amount, mode } = useLocalSearchParams<{ contactId?: string; amount: string; mode?: "topup" }>();
  const { addTransaction, signOut } = useStore();
  const [pin, setPin] = useState("");
  const shake = useSharedValue(0);

  const sending = pin.length === LENGTH;
  const topUp = mode === "topup";

  useEffect(() => {
    if (!sending) return;
    const value = Number(amount) || 0;
    const shown = `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const t = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (mode === "topup") {
        addTransaction({ title: "Wallet Top-up", kind: "topup", amount: value, category: "My Wallet" });
        router.replace({ pathname: "/success", params: { title: "Top Up Successful!", body: `You added ${shown} to your wallet` } });
      } else {
        const contact = findContact(contactId);
        addTransaction({ title: "Transfer", kind: "sent", amount: -value, category: contact.name });
        router.replace({ pathname: "/success", params: { title: "Transfer Successful!", body: `You sent ${shown} to ${contact.name}` } });
      }
    }, SENDING_MS);
    return () => clearTimeout(t);
  }, [sending, contactId, amount, mode, addTransaction, router]);

  const onKey = (k: KeypadKey) => {
    if (sending) return;
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
  const padStyle = useAnimatedStyle(() => ({
    opacity: withTiming(sending ? 0.25 : 1, { duration: 250 }),
    transform: [{ translateY: withTiming(sending ? 12 : 0, { duration: 300, easing: Easing.out(Easing.cubic) }) }],
  }));

  return (
    <Screen>
      <Animated.View key={sending ? "sending" : "pin"} entering={FadeIn.duration(220)} style={styles.copy}>
        <AppText variant="h4" weight="semiBold">
          {sending ? (topUp ? "Adding money…" : "Sending money…") : "Enter your PIN"}
        </AppText>
        <AppText variant="body" tone="secondary">
          {sending ? "This will only take a moment" : "Please enter your 6-digits PIN"}
        </AppText>
      </Animated.View>
      <Animated.View style={[styles.dots, dotsStyle]}>
        {Array.from({ length: LENGTH }, (_, i) => (
          <Dot key={i} index={i} filled={i < pin.length} wave={sending} />
        ))}
      </Animated.View>
      <Animated.View style={padStyle} pointerEvents={sending ? "none" : "auto"}>
        <Keypad onKey={onKey} />
      </Animated.View>
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

/**
 * 16pt dot: Text/Quaternary when empty, Brand/Secondary when filled; pops as it fills. While
 * sending, each dot hops in turn (offset by its index), so the row reads as a loader.
 */
function Dot({ index, filled, wave }: { index: number; filled: boolean; wave: boolean }) {
  const p = useSharedValue(filled ? 1 : 0);
  const y = useSharedValue(0);
  useEffect(() => {
    p.value = filled ? withSpring(1, { damping: 9, stiffness: 320 }) : withTiming(0, { duration: 120 });
  }, [filled, p]);
  useEffect(() => {
    if (!wave) {
      cancelAnimation(y);
      y.value = withTiming(0, { duration: 150 });
      return;
    }
    const hop = withSequence(
      withTiming(-14, { duration: 260, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) }),
      withTiming(0, { duration: 6 * 70 }),
    );
    y.value = withDelay(250 + index * 70, withRepeat(hop, -1));
  }, [wave, index, y]);
  const fill = useAnimatedStyle(() => ({ opacity: Math.min(p.value, 1), transform: [{ scale: 0.4 + 0.6 * p.value }] }));
  const hop = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[styles.dot, hop]}>
      <Animated.View style={[styles.dotFill, fill]} />
    </Animated.View>
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
