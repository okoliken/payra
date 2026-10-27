import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, {
  FadeOut,
  LinearTransition,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText, Button, Header, Screen } from "@/components/ui";
import { Keypad, type KeypadKey } from "@/components/keypad";
import { ReviewSheet } from "@/components/review-sheet";
import { useGuardedRouter } from "@/lib/navigation";
import { formatMoney } from "@/lib/format";
import { EASE, SHAKE, fade, rise } from "@/lib/motion";
import { recipientDetail, type Recipient } from "@/data/mock";
import { useStore } from "@/store/app-store";
import { DEMO_HOOKS, demoBus } from "@/lib/demo";

/**
 * Step 1 of sending: the amount. Continue goes to "Send to" (who); a top-up (`mode=topup`) or a
 * repeat payment from a receipt (recipient params) already knows who, so it opens Review directly.
 * Going over the balance turns the amount red, shakes it with an error haptic and says why.
 */
export default function SendScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const params = useLocalSearchParams<{ mode?: "topup"; name?: string; channel?: "Payra" | "Bank"; provider?: string; account?: string }>();
  const balance = useStore((s) => s.balance);
  const topUp = params.mode === "topup";
  const known: Recipient | undefined =
    params.name && params.channel && params.account
      ? { name: params.name, channel: params.channel, provider: params.provider, account: params.account }
      : undefined;

  const [raw, setRaw] = useState("");
  const [review, setReview] = useState(false);
  const amount = Number(raw) || 0;
  const over = !topUp && amount > balance;
  const shake = useSharedValue(0);
  const red = useSharedValue(0);

  useEffect(() => {
    red.value = withTiming(over ? 1 : 0, { duration: 180 });
    if (over) AccessibilityInfo.announceForAccessibility(`Insufficient balance. You have ${formatMoney(balance)}`);
  }, [over, red, balance]);

  const reject = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    shake.value = withSequence(...SHAKE.map((x) => withTiming(x, { duration: 40 })));
  };

  const next = (r: string, k: KeypadKey) => {
    if (k === "del") return r.slice(0, -1);
    if (k === ".") return r.includes(".") ? r : (r || "0") + ".";
    if (r === "0") return k;
    if (r.includes(".") && r.split(".")[1]!.length >= 2) return r;
    return r.replace(".", "").length < 7 ? r + k : r;
  };

  // Every key that leaves the amount over the balance shakes again, not just the first one.
  const onKey = (k: KeypadKey) => {
    const value = next(raw, k);
    if (k !== "del" && !topUp && Number(value) > balance) reject();
    setRaw(value);
  };
  const onKeyRef = useRef(onKey);
  useEffect(() => {
    onKeyRef.current = onKey;
  });

  // Demo tour: keypad presses arrive over the demo bus, as if tapped.
  useEffect(() => {
    if (!DEMO_HOOKS) return;
    return demoBus.on("key", (k) => onKeyRef.current(k as KeypadKey));
  }, []);

  // "$1,250.5": group the whole part, keep what was typed after the point.
  const [whole, fraction] = raw.split(".");
  const shown = `$${Number(whole || 0).toLocaleString("en-US")}${fraction !== undefined ? `.${fraction}` : ""}`;

  const amountStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const colorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(red.value, [0, 1], [theme.colors.text, theme.colors.danger]),
  }));

  const onContinue = () => {
    if (over) return reject();
    if (topUp || known) return setReview(true);
    router.push({ pathname: "/send-to", params: { amount: String(amount) } });
  };

  return (
    <Screen>
      <Header title={topUp ? "Top Up" : "Send Money"} />
      {known ? (
        <Animated.View entering={fade()} style={styles.to}>
          <AppText variant="captionL" tone="secondary" align="center">
            To {known.name} · {recipientDetail(known)}
          </AppText>
        </Animated.View>
      ) : null}

      <View style={styles.center}>
        <Animated.View
          style={[styles.amount, amountStyle]}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`Amount ${shown}`}
        >
          {shown.split("").map((ch, i) => (
            <Animated.Text
              key={`${i}-${ch}`}
              entering={rise()}
              exiting={FadeOut.duration(100)}
              layout={LinearTransition.duration(200).easing(EASE)}
              style={[styles.char, colorStyle, !raw && styles.placeholder]}
            >
              {ch}
            </Animated.Text>
          ))}
        </Animated.View>
        <Animated.View key={over ? "over" : "ok"} entering={fade()}>
          {over ? (
            <AppText variant="captionL" weight="semiBold" tone="danger" align="center">
              {`Insufficient balance · You have ${formatMoney(balance)}`}
            </AppText>
          ) : (
            <AppText variant="captionL" tone="tertiary" align="center">
              Your Balance{" "}
              <AppText variant="captionL" weight="semiBold" tone="onBrand">
                {formatMoney(balance)}
              </AppText>
            </AppText>
          )}
        </Animated.View>
      </View>

      <Keypad decimal onKey={onKey} />
      <Button title="Continue" style={styles.cta} disabled={amount <= 0} haptic={!over} onPress={onContinue} />

      <ReviewSheet visible={review} onClose={() => setReview(false)} amount={amount} recipient={known} />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  to: { marginTop: -8 },
  center: { flex: 1, justifyContent: "center", gap: 8 },
  amount: { flexDirection: "row", justifyContent: "center" },
  char: { ...theme.fonts.bold, ...theme.typography.display },
  placeholder: { color: theme.colors.textQuaternary },
  cta: { marginTop: 32 },
}));
