import { useEffect, useState } from "react";
import { Pressable, Share, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText, Button, Header, Screen } from "@/components/ui";
import { AppIcon } from "@/components/app-icon";
import { useGuardedRouter } from "@/lib/navigation";
import { formatMoneyWorklet } from "@/lib/format";
import { EASE, fade, rise } from "@/lib/motion";
import type { Transaction } from "@/data/mock";
import { useStore } from "@/store/app-store";


// Loaded lazily: an app binary built before expo-clipboard was added has no native module, and a
// top-level import would crash the whole screen instead of just skipping the copy.
const copyText = (text: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require("expo-clipboard") as typeof import("expo-clipboard")).setStringAsync(text).catch(() => {});
  } catch {}
};
const AnimatedInput = Animated.createAnimatedComponent(TextInput);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const methodFor = (tx: Transaction) =>
  tx.method ??
  { sent: "Payra Users", received: "Payra Users", topup: "Top Up", subscription: "Card Payment", bill: "Bill Payment" }[tx.kind];

const reference = (tx: Transaction) => `PYR${tx.id.replace(/\D/g, "").slice(-10).padStart(10, "0")}`;

/**
 * Not in Figma: the receipt for a transaction, built from the design system (B1 card, IconCircle
 * rhythm, Body / Caption type). On open the status check draws itself, the amount counts up and
 * the rows fade in one after another. The reference copies with a Copy → Copied cross-fade.
 */
export default function TransactionDetailsScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tx = useStore((s) => s.transactions.find((t) => t.id === id));

  const counted = useSharedValue(0);
  useEffect(() => {
    if (tx) counted.value = withDelay(150, withTiming(Math.abs(tx.amount), { duration: 600, easing: EASE }));
  }, [tx, counted]);
  const amountProps = useAnimatedProps(() => {
    const text = formatMoneyWorklet(counted.value);
    return { text, defaultValue: text } as object;
  });

  if (!tx) {
    return (
      <Screen>
        <Header title="Transaction Details" />
      </Screen>
    );
  }

  const incoming = tx.amount > 0;
  const date = new Date(tx.at);
  const when = `${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  const amount = `$${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const rows: { label: string; value: string; copy?: boolean; good?: boolean }[] = [
    { label: incoming ? "From" : "To", value: tx.category },
    ...(tx.detail && tx.method !== "My Wallet" ? [{ label: "Account", value: tx.detail }] : []),
    { label: "Method", value: methodFor(tx) },
    { label: "Reference", value: reference(tx), copy: true },
    { label: "Amount", value: amount },
    { label: "Fee", value: "Free", good: true },
    { label: "Total", value: amount },
  ];
  const canRepeat = tx.kind === "sent" && tx.method !== undefined;

  const share = () =>
    Share.share({
      message: [`Payra receipt · ${tx.status}`, `${tx.title}: ${amount}`, ...rows.map((r) => `${r.label}: ${r.value}`), when].join("\n"),
    }).catch(() => {});

  const sendAgain = () =>
    router.push({
      pathname: "/send-amount",
      params: tx.contactId
        ? { contactId: tx.contactId, via: tx.method ?? "Payra Users" }
        : { name: tx.category, detail: tx.detail ?? "", via: tx.method ?? "Payra Users" },
    });

  return (
    <Screen scroll>
      <Header title="Transaction Details" />

      <View style={styles.ticket}>
        <View style={styles.top}>
          <StatusMark ok={tx.status === "Completed"} />
          <Animated.View entering={fade(100)} style={styles.center}>
            <AppText variant="body" tone="secondary" align="center">
              {tx.title} {tx.status === "Completed" ? "Successful" : tx.status}
            </AppText>
            <View style={styles.amountRow}>
              <AppText variant="h2" weight="bold" tone={incoming ? "success" : "primary"}>
                {incoming ? "+" : "-"}
              </AppText>
              <AnimatedInput
                editable={false}
                pointerEvents="none"
                animatedProps={amountProps}
                style={[styles.amount, incoming && { color: theme.colors.success }]}
              />
            </View>
            <AppText variant="captionL" tone="tertiary" align="center">
              {when}
            </AppText>
          </Animated.View>
        </View>

        {/* Tear line: dashes between two notches cut out of the card edges */}
        <View style={styles.tear}>
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={styles.dashes}>
            {Array.from({ length: 26 }, (_, i) => (
              <View key={i} style={styles.dash} />
            ))}
          </View>
          <View style={[styles.notch, styles.notchRight]} />
        </View>

        <View style={styles.rows}>
          {rows.map((r, i) => (
            <Animated.View
              key={r.label}
              entering={rise(200 + i * 35)}
              style={[styles.row, r.label === "Total" && styles.totalRow]}
            >
              <AppText variant="body" tone="secondary">
                {r.label}
              </AppText>
              <View style={styles.value}>
                <AppText
                  variant="body"
                  weight="semiBold"
                  tone={r.good ? "success" : "primary"}
                  numberOfLines={1}
                  style={styles.valueText}
                >
                  {r.value}
                </AppText>
                {r.copy ? <CopyPill text={r.value} /> : null}
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View entering={rise(480)} style={styles.actions}>
        <Button title="Share Receipt" variant="outline" style={styles.flex} onPress={share} />
        {canRepeat ? <Button title="Send Again" style={styles.flex} onPress={sendAgain} /> : null}
      </Animated.View>
    </Screen>
  );
}

/** Green disc whose check mark draws itself (stroke dash offset) once the disc has faded in. */
function StatusMark({ ok }: { ok: boolean }) {
  const { theme } = useUnistyles();
  const draw = useSharedValue(0);
  useEffect(() => {
    draw.value = withDelay(180, withTiming(1, { duration: 360, easing: EASE }));
  }, [draw]);
  const LENGTH = 26;
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - draw.value) }));
  const color = ok ? theme.colors.success : theme.colors.warning;
  return (
    <Animated.View entering={fade()} style={[styles.statusOuter, { backgroundColor: ok ? theme.colors.successSoft : theme.colors.warningSoft }]}>
      <View style={[styles.statusInner, { backgroundColor: color }]}>
        <Svg width={28} height={28} viewBox="0 0 28 28">
          <AnimatedPath
            d="M7 14.5 L12 19.5 L21 9.5"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={LENGTH}
            animatedProps={checkProps}
          />
        </Svg>
      </View>
    </Animated.View>
  );
}

/** Copy pill: copies, then cross-fades to a green "Copied" with a check for a moment. */
function CopyPill({ text }: { text: string }) {
  const { theme } = useUnistyles();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <Pressable
      hitSlop={8}
      onPress={() => {
        copyText(text);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setCopied(true);
      }}
    >
      <View style={[styles.copy, copied && styles.copied]}>
        <Animated.View key={copied ? "y" : "n"} entering={fade()} style={styles.copyInner}>
          {copied ? <AppIcon name="check" size={12} color={theme.colors.success} /> : null}
          <AppText variant="captionS" weight="semiBold" tone={copied ? "success" : "onBrand"}>
            {copied ? "Copied" : "Copy"}
          </AppText>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  ticket: { borderRadius: 24, backgroundColor: theme.colors.surfaceRaised, overflow: "hidden" },
  top: { alignItems: "center", gap: 16, paddingTop: 28, paddingBottom: 20, paddingHorizontal: 18 },
  center: { alignItems: "center", gap: 6 },
  amountRow: { flexDirection: "row", alignItems: "center" },
  amount: { padding: 0, color: theme.colors.text, fontFamily: theme.fonts.bold, ...theme.typography.h2 },
  statusOuter: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  statusInner: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  tear: { height: 24, justifyContent: "center" },
  notch: { position: "absolute", width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.background },
  notchLeft: { left: -12 },
  notchRight: { right: -12 },
  dashes: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 22 },
  dash: { width: 6, height: 1.5, borderRadius: 1, backgroundColor: theme.colors.stroke.strong },
  rows: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 18, gap: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  totalRow: { paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.stroke.soft },
  value: { flexShrink: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  valueText: { flexShrink: 1 },
  copy: { height: 24, paddingHorizontal: 10, borderRadius: 12, justifyContent: "center", backgroundColor: theme.colors.brand },
  copied: { backgroundColor: theme.colors.successSoft },
  copyInner: { flexDirection: "row", alignItems: "center", gap: 4 },
  actions: { flexDirection: "row", gap: 12, marginTop: 24 },
  flex: { flex: 1 },
}));
