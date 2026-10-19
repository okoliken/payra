import { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, {
  Easing,
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText, Button, Header, IconCircle, Screen } from "@/components/ui";
import { Keypad, type KeypadKey } from "@/components/keypad";
import { useGuardedRouter } from "@/lib/navigation";
import { formatMoney } from "@/lib/format";
import { contacts } from "@/data/mock";
import { useStore } from "@/store/app-store";

const EASE = Easing.out(Easing.cubic);

/**
 * Not in the Figma file: the step between Select Contact and Enter PIN, built from the file's
 * own parts (contact row, PIN keypad, Primary button). Each digit drops in as it is typed; going
 * over the balance turns the amount red and shakes it.
 */
export default function SendAmountScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { contactId } = useLocalSearchParams<{ contactId: string }>();
  const balance = useStore((s) => s.balance);
  const contact = contacts.find((c) => c.id === contactId) ?? contacts[0]!;
  const [raw, setRaw] = useState("");

  const amount = Number(raw) || 0;
  const over = amount > balance;
  const shake = useSharedValue(0);
  const red = useSharedValue(0);

  useEffect(() => {
    red.value = withTiming(over ? 1 : 0, { duration: 180 });
    if (over) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      shake.value = withSequence(...[-10, 10, -7, 7, -3, 0].map((x) => withTiming(x, { duration: 45 })));
    }
  }, [over, red, shake]);

  const onKey = (k: KeypadKey) =>
    setRaw((r) => {
      if (k === "del") return r.slice(0, -1);
      if (k === ".") return r.includes(".") ? r : (r || "0") + ".";
      if (r === "0") return k;
      if (r.includes(".") && r.split(".")[1]!.length >= 2) return r;
      return r.replace(".", "").length < 7 ? r + k : r;
    });

  // "$1,250.5": group the whole part, keep what was typed after the point.
  const [whole, fraction] = raw.split(".");
  const shown = `$${Number(whole || 0).toLocaleString("en-US")}${fraction !== undefined ? `.${fraction}` : ""}`;

  const amountStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const colorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(red.value, [0, 1], [theme.colors.text, theme.colors.danger]),
  }));

  return (
    <Screen>
      <Header title="Transfer" />
      <View style={styles.recipient}>
        <IconCircle>
          <AppText variant="captionL" weight="semiBold" style={styles.black}>
            {contact.name[0]}
          </AppText>
        </IconCircle>
        <View style={styles.gap6}>
          <AppText variant="body" weight="semiBold">
            {contact.name}
          </AppText>
          <AppText variant="captionL" tone="secondary">
            {contact.phone}
          </AppText>
        </View>
      </View>

      <View style={styles.center}>
        <Animated.View style={[styles.amount, amountStyle]}>
          {shown.split("").map((ch, i) => (
            <Animated.Text
              key={`${i}-${ch}`}
              entering={FadeInDown.duration(220).easing(EASE)}
              exiting={FadeOutDown.duration(140)}
              layout={LinearTransition.duration(200).easing(EASE)}
              style={[styles.char, colorStyle, !raw && styles.placeholder]}
            >
              {ch}
            </Animated.Text>
          ))}
        </Animated.View>
        <AppText variant="captionL" tone={over ? "danger" : "secondary"} align="center">
          Your Balance {formatMoney(balance)}
        </AppText>
      </View>

      <Keypad decimal onKey={onKey} />
      <Button
        title="Continue"
        style={styles.cta}
        disabled={amount <= 0 || over}
        onPress={() => router.push({ pathname: "/pin", params: { contactId: contact.id, amount: String(amount) } })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  recipient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceRaised,
  },
  black: { color: theme.palette.black },
  gap6: { gap: 6 },
  center: { flex: 1, justifyContent: "center", gap: 8 },
  amount: { flexDirection: "row", justifyContent: "center" },
  char: { fontFamily: theme.fonts.bold, ...theme.typography.display },
  placeholder: { color: theme.colors.textQuaternary },
  cta: { marginTop: 32 },
}));
