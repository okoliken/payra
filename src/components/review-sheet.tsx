import { useCallback, useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppText, Button, IconCircle } from "@/components/ui";
import { AppIcon } from "@/components/app-icon";
import { PinPad } from "@/components/pin-pad";
import { PersonAvatar } from "@/components/person-avatar";
import { Sheet } from "@/components/sheet";
import { useGuardedRouter } from "@/lib/navigation";
import { formatMoney } from "@/lib/format";
import { fade } from "@/lib/motion";
import { recipientDetail, type Recipient } from "@/data/mock";
import { useStore } from "@/store/app-store";
import { startPaymentActivity } from "../../modules/payra-activity";

/** How long a transfer takes to "arrive" in the demo (drives the Live Activity ring). */
const DELIVERY_SECONDS = 5;

/** Where top-ups are pulled from in the demo. */
const TOP_UP_SOURCE = { provider: "BCA", account: "•••• 0190" };

/**
 * The last two steps of a payment, in one sheet: Review (who, how much, fee, total) and then
 * Enter PIN. Moving between them cross-fades the content while the sheet eases to its new
 * height. A correct PIN (any 6 digits) records the transaction and opens the result screen.
 */
export function ReviewSheet({
  visible,
  onClose,
  amount,
  recipient,
}: {
  visible: boolean;
  onClose: () => void;
  amount: number;
  /** Omit for a top-up into your own wallet. */
  recipient?: Recipient;
}) {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const addTransaction = useStore((s) => s.addTransaction);
  const [step, setStep] = useState<"review" | "pin">("review");
  const money = formatMoney(amount);
  const topUp = !recipient;

  const close = () => {
    onClose();
    setTimeout(() => setStep("review"), 300);
  };

  const confirm = useCallback(() => {
    if (topUp) {
      const tx = addTransaction({
        title: "Wallet Top-up",
        kind: "topup",
        amount,
        category: "My Wallet",
        method: "My Wallet",
        detail: `${TOP_UP_SOURCE.provider} · ${TOP_UP_SOURCE.account}`,
      });
      router.replace({ pathname: "/success", params: { id: tx.id, kind: "topup", title: "Top Up Successful!", body: `You added ${money} to your wallet` } });
    } else {
      const tx = addTransaction({
        title: "Transfer",
        kind: "sent",
        amount: -amount,
        category: recipient.name,
        detail: recipientDetail(recipient),
        method: recipient.channel === "Payra" ? "Payra Users" : "Bank",
      });
      // Delivery shows in the Dynamic Island / lock screen if the app is left while it is on its way.
      startPaymentActivity({
        direction: "outgoing",
        amount: money,
        counterparty: recipient.name,
        detail: recipientDetail(recipient),
        seconds: DELIVERY_SECONDS,
      });
      router.replace({ pathname: "/success", params: { id: tx.id, kind: "transfer", title: "Transfer Successful!", body: `You sent ${money} to ${recipient.name}` } });
    }
  }, [topUp, amount, money, recipient, addTransaction, router]);

  return (
    <Sheet visible={visible} onClose={close}>
      {step === "review" ? (
        <Animated.View key="review" entering={fade()} style={styles.step}>
          <AppText variant="h5" weight="semiBold" align="center">
            {topUp ? "Review Top Up" : "Review Transfer"}
          </AppText>

          <View style={styles.amountBlock}>
            <AppText variant="h1" weight="bold" align="center">
              {money}
            </AppText>
            <AppText variant="body" tone="secondary" align="center">
              {topUp ? "to My Wallet" : `to ${recipient.name}`}
            </AppText>
          </View>

          <View style={styles.card}>
            <View style={styles.party}>
              {topUp ? (
                <IconCircle>
                  <AppIcon name="wallet-money-bold" size={24} color={theme.colors.text} />
                </IconCircle>
              ) : (
                <PersonAvatar name={recipient.name} provider={recipient.provider} />
              )}
              <View style={styles.partyText}>
                <AppText variant="body" weight="semiBold">
                  {topUp ? "From" : recipient.name}
                </AppText>
                <AppText variant="captionL" tone="secondary">
                  {topUp ? `${TOP_UP_SOURCE.provider} · ${TOP_UP_SOURCE.account}` : recipientDetail(recipient)}
                </AppText>
              </View>
            </View>
            <View style={styles.divider} />
            <Row label="Amount" value={money} />
            <Row label="Fee" value="Free" good />
            <Row label="Arrives" value="Instantly" />
            <View style={styles.divider} />
            <Row label="Total" value={money} strong />
          </View>

          <Button title={topUp ? `Top Up ${money}` : `Send ${money}`} onPress={() => setStep("pin")} />
        </Animated.View>
      ) : (
        <Animated.View key="pin" entering={fade()} style={styles.step}>
          <View style={styles.pinCopy}>
            <AppText variant="h5" weight="semiBold" align="center">
              Enter your PIN
            </AppText>
            <AppText variant="body" tone="secondary" align="center">
              {topUp ? `to add ${money} to your wallet` : `to send ${money} to ${recipient.name}`}
            </AppText>
          </View>
          <PinPad compact onComplete={confirm} />
        </Animated.View>
      )}
    </Sheet>
  );
}

function Row({ label, value, good, strong }: { label: string; value: string; good?: boolean; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <AppText variant="body" tone="secondary">
        {label}
      </AppText>
      <AppText variant={strong ? "bodyL" : "body"} weight="semiBold" tone={good ? "success" : "primary"}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  step: { gap: 20 },
  amountBlock: { gap: 4 },
  card: { gap: 14, padding: 18, borderRadius: 24, backgroundColor: theme.colors.surfaceRaised },
  party: { flexDirection: "row", alignItems: "center", gap: 12 },
  partyText: { flex: 1, gap: 4 },
  divider: { height: 1, backgroundColor: theme.colors.stroke.soft },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pinCopy: { gap: 6, marginBottom: 8 },
}));
