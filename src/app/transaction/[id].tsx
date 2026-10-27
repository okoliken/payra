import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText, Button, Header, IconCircle, Screen } from "@/components/ui";
import { AppIcon, type IconName } from "@/components/app-icon";
import { SuccessMark } from "@/components/brand-marks";
import { PersonAvatar } from "@/components/person-avatar";
import { ReceiptSheet } from "@/components/receipt-sheet";
import { DEMO_HOOKS } from "@/lib/demo";
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

const methodFor = (tx: Transaction) =>
  tx.method ??
  { sent: "Payra Users", received: "Payra Users", topup: "Top Up", subscription: "Card Payment", bill: "Bill Payment" }[tx.kind];

const reference = (tx: Transaction) => `PYR${tx.id.replace(/\D/g, "").slice(-10).padStart(10, "0")}`;

const iconFor: Record<Transaction["kind"], IconName> = {
  received: "arrow-left-down",
  topup: "arrow-left-down",
  sent: "arrow-right-up",
  subscription: "card",
  bill: "card",
};

/** Bank name from a detail like "BCA · 0912345678"; undefined for Payra users and wallets. */
const providerOf = (tx: Transaction) => (tx.method === "Bank" ? tx.detail?.split(" · ")[0] : undefined);

const STATUS_TONE = { Completed: "success", Pending: "warning", Failed: "danger" } as const;

/**
 * Not in Figma: the receipt for a transaction, built from the design system (B1 card, IconCircle
 * rhythm, Body / Caption type). On open our SuccessMark draws its check, the amount counts up and
 * the rows fade in one after another. The reference copies with a Copy → Copied cross-fade.
 */
export default function TransactionDetailsScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { id, receipt: receiptParam } = useLocalSearchParams<{ id: string; receipt?: string }>();
  const tx = useStore((s) => s.transactions.find((t) => t.id === id));
  const [receipt, setReceipt] = useState(false);
  // Dev-only (demo tour): `receipt=1` opens the receipt sheet once the rows have animated in.
  useEffect(() => {
    if (!DEMO_HOOKS || receiptParam !== "1") return;
    const t = setTimeout(() => setReceipt(true), 2600);
    return () => clearTimeout(t);
  }, [receiptParam]);

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
  const canRepeat = tx.kind === "sent" && !!tx.detail;
  const provider = providerOf(tx);
  const person = !!tx.detail && (tx.kind === "sent" || tx.kind === "received");
  const details = [
    { label: "Method", value: methodFor(tx) },
    { label: "Reference", value: reference(tx), copy: true },
  ];
  const totals = rows.filter((r) => ["Amount", "Fee", "Total"].includes(r.label));

  // Detail is "BCA · 0912345678" for banks and "Payra · +62 …" for Payra users.
  const sendAgain = () => {
    const [provider, account = ""] = (tx.detail ?? "").split(" · ");
    router.push({
      pathname: "/send",
      params:
        tx.method === "Bank"
          ? { name: tx.category, channel: "Bank", provider, account }
          : { name: tx.category, channel: "Payra", account },
    });
  };

  return (
    <Screen scroll>
      <Header title="Transaction Details" />

      <View style={styles.ticket}>
        <View style={styles.top}>
          <SuccessMark width={72} />
          <Animated.View entering={fade(100)} style={styles.center}>
            <View style={[styles.status, styles[`status${tx.status}`]]}>
              <AppText variant="captionS" weight="semiBold" tone={STATUS_TONE[tx.status]}>
                {tx.title} {tx.status === "Completed" ? "Successful" : tx.status}
              </AppText>
            </View>
            <View style={styles.amountRow}>
              <AppText variant="h2" weight="bold" tone={incoming ? "success" : "danger"}>
                {incoming ? "+" : "-"}
              </AppText>
              <AnimatedInput
                editable={false}
                pointerEvents="none"
                animatedProps={amountProps}
                style={[styles.amount, { color: incoming ? theme.colors.success : theme.colors.danger }]}
              />
            </View>
            <AppText variant="captionL" tone="tertiary" align="center">
              {when}
            </AppText>
          </Animated.View>

          {/* Who: logo or initials, name, account */}
          <Animated.View entering={rise(180)} style={styles.party}>
            {person ? (
              <PersonAvatar name={tx.category} provider={provider} />
            ) : (
              <IconCircle>
                <AppIcon name={iconFor[tx.kind]} size={22} color={theme.colors.text} />
              </IconCircle>
            )}
            <View style={styles.partyText}>
              <AppText variant="captionS" tone="tertiary">
                {incoming ? "From" : "To"}
              </AppText>
              <AppText variant="body" weight="semiBold" numberOfLines={1}>
                {tx.category}
              </AppText>
            </View>
            {tx.detail && tx.method !== "My Wallet" ? (
              <AppText variant="captionL" tone="secondary" numberOfLines={1} style={styles.partyDetail}>
                {tx.detail}
              </AppText>
            ) : null}
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
          {details.map((r, i) => (
            <Animated.View key={r.label} entering={rise(240 + i * 35)} style={styles.row}>
              <AppText variant="body" tone="secondary">
                {r.label}
              </AppText>
              <View style={styles.value}>
                <AppText variant="body" weight="semiBold" numberOfLines={1} style={styles.valueText}>
                  {r.value}
                </AppText>
                {r.copy ? <CopyPill text={r.value} /> : null}
              </View>
            </Animated.View>
          ))}

          <Animated.View entering={rise(240 + details.length * 35)} style={styles.totals}>
            {totals.map((r) => (
              <View key={r.label} style={[styles.row, r.label === "Total" && styles.totalRow]}>
                <AppText variant={r.label === "Total" ? "body" : "captionL"} tone="secondary" weight={r.label === "Total" ? "semiBold" : "regular"}>
                  {r.label}
                </AppText>
                <AppText
                  variant={r.label === "Total" ? "bodyL" : "body"}
                  weight="semiBold"
                  tone={r.good ? "success" : "primary"}
                >
                  {r.value}
                </AppText>
              </View>
            ))}
          </Animated.View>
        </View>
      </View>

      <Animated.View entering={rise(480)} style={styles.actions}>
        <Button title="Share Receipt" variant="outline" style={styles.flex} onPress={() => setReceipt(true)} />
        {canRepeat ? <Button title="Send Again" style={styles.flex} onPress={sendAgain} /> : null}
      </Animated.View>

      <ReceiptSheet visible={receipt} onClose={() => setReceipt(false)} tx={tx} rows={rows} amount={amount} when={when} />
    </Screen>
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
      accessibilityRole="button"
      accessibilityLabel={copied ? "Reference copied" : "Copy reference"}
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
  center: { alignItems: "center", gap: 8 },
  status: { height: 24, paddingHorizontal: 10, borderRadius: 12, justifyContent: "center" },
  statusCompleted: { backgroundColor: theme.colors.successSoft },
  statusPending: { backgroundColor: theme.colors.warningSoft },
  statusFailed: { backgroundColor: theme.colors.dangerSoft },
  party: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    padding: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
  },
  partyText: { flex: 1, gap: 2 },
  partyDetail: { flexShrink: 1, maxWidth: "45%" },
  totals: { gap: 12, padding: 14, borderRadius: 16, backgroundColor: theme.colors.background },
  amountRow: { flexDirection: "row", alignItems: "center" },
  amount: { padding: 0, color: theme.colors.text, ...theme.fonts.bold, ...theme.typography.h2 },
  tear: { height: 24, justifyContent: "center" },
  notch: { position: "absolute", width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.background },
  notchLeft: { left: -12 },
  notchRight: { right: -12 },
  dashes: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 22 },
  dash: { width: 6, height: 1.5, borderRadius: 1, backgroundColor: theme.colors.stroke.strong },
  rows: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 18, gap: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  totalRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.stroke.soft },
  value: { flexShrink: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  valueText: { flexShrink: 1 },
  copy: { height: 24, paddingHorizontal: 10, borderRadius: 12, justifyContent: "center", backgroundColor: theme.colors.brand },
  copied: { backgroundColor: theme.colors.successSoft },
  copyInner: { flexDirection: "row", alignItems: "center", gap: 4 },
  actions: { flexDirection: "row", gap: 12, marginTop: 24 },
  flex: { flex: 1 },
}));
