import { useRef, useState } from "react";
import { Share, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppText, Button, Logo } from "@/components/ui";
import { Sheet } from "@/components/sheet";
import type { Transaction } from "@/data/mock";

export type ReceiptRow = { label: string; value: string; good?: boolean };

/** The logo's plate shape, used as the status seal in the receipt header. */
const PLATE = "M0 22.75V0L29.8701 0L40 9.5V30H7.53247L0 22.75Z";
const CHECK = "M10.5 14.6 L16.2 20.2 L27.5 8.9";

// Loaded lazily, like expo-clipboard: a binary built before react-native-view-shot was added has no
// native module, and we would rather fall back to a text receipt than crash the sheet.
const captureView = async (ref: unknown): Promise<string | null> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { captureRef } = require("react-native-view-shot") as typeof import("react-native-view-shot");
    return await captureRef(ref as never, { format: "png", quality: 1, result: "tmpfile" });
  } catch {
    return null;
  }
};

/**
 * Not in Figma: the shareable receipt. A tall, paper-like card in Payra's own voice (teal
 * header with the logo and a check seal, the amount, a torn edge, then the details and a footer
 * with the reference) that is captured as an image and handed to the share sheet. If image
 * capture is unavailable it falls back to a plain-text receipt.
 */
export function ReceiptSheet({
  visible,
  onClose,
  tx,
  rows,
  amount,
  when,
}: {
  visible: boolean;
  onClose: () => void;
  tx: Transaction;
  rows: ReceiptRow[];
  amount: string;
  when: string;
}) {
  const { theme } = useUnistyles();
  const shot = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const incoming = tx.amount > 0;
  const ok = tx.status === "Completed";
  const headline = `${tx.title} ${ok ? "Successful" : tx.status}`;
  const reference = rows.find((r) => r.label === "Reference")?.value;

  const text = [`Payra receipt · ${headline}`, `${incoming ? "+" : "-"}${amount}`, when, "", ...rows.map((r) => `${r.label}: ${r.value}`)].join("\n");

  const share = async () => {
    setSharing(true);
    const url = await captureView(shot.current);
    setSharing(false);
    await Share.share(url ? { url, message: text } : { message: text }).catch(() => {});
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={styles.wrap}>
        {/* Everything inside `shot` is what ends up in the shared image. */}
        <View ref={shot} collapsable={false} style={styles.paper}>
          <View style={styles.head}>
            <View style={styles.headTop}>
              <Logo size={28} onDark />
              <View style={[styles.badge, !ok && styles.badgeWarn]}>
                <AppText variant="captionS" weight="semiBold" tone="onBrand">
                  {ok ? "PAID" : tx.status.toUpperCase()}
                </AppText>
              </View>
            </View>

            <View style={styles.seal}>
              <Svg width={44} height={33} viewBox="0 0 40 30">
                <Path d={PLATE} fill={theme.colors.brand} />
                <Path d={CHECK} stroke={theme.colors.brandDark} strokeWidth={3.4} strokeLinecap="square" fill="none" />
              </Svg>
            </View>

            <View style={styles.headText}>
              <AppText variant="captionL" tone="onDarkMuted" align="center">
                {headline}
              </AppText>
              <AppText variant="h2" weight="bold" tone="onDark" align="center">
                {incoming ? "+" : "-"}
                {amount}
              </AppText>
              <AppText variant="captionL" tone="onDarkMuted" align="center">
                {when}
              </AppText>
            </View>
          </View>

          {/* Torn edge between the teal header and the paper body */}
          <View style={styles.tear}>
            <View style={[styles.notch, styles.notchLeft]} />
            <View style={styles.dashes}>
              {Array.from({ length: 22 }, (_, i) => (
                <View key={i} style={styles.dash} />
              ))}
            </View>
            <View style={[styles.notch, styles.notchRight]} />
          </View>

          <View style={styles.body}>
            {rows
              .filter((r) => r.label !== "Reference")
              .map((r) => (
                <View key={r.label} style={[styles.row, r.label === "Total" && styles.totalRow]}>
                  <AppText variant="captionL" tone="secondary">
                    {r.label}
                  </AppText>
                  <AppText
                    variant={r.label === "Total" ? "body" : "captionL"}
                    weight="semiBold"
                    tone={r.good ? "success" : "primary"}
                    numberOfLines={1}
                    style={styles.valueText}
                  >
                    {r.value}
                  </AppText>
                </View>
              ))}
          </View>

          <View style={styles.foot}>
            <View style={styles.footText}>
              <AppText variant="captionS" tone="tertiary">
                Reference
              </AppText>
              <AppText variant="captionL" weight="semiBold" style={styles.mono}>
                {reference}
              </AppText>
            </View>
            <AppText variant="captionS" tone="tertiary" align="right">
              Powered by Payra{"\n"}payra.app
            </AppText>
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="Close" variant="outline" style={styles.flex} onPress={onClose} />
          <Button title="Share" style={styles.flex} loading={sharing} onPress={share} />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrap: { gap: 16 },
  paper: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: theme.palette.white,
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
  },
  head: { backgroundColor: theme.palette.brand.secondary, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22, gap: 18 },
  headTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { height: 22, paddingHorizontal: 10, borderRadius: 11, justifyContent: "center", backgroundColor: theme.palette.brand.primary },
  badgeWarn: { backgroundColor: theme.palette.yellow.stroke },
  seal: { alignItems: "center" },
  headText: { gap: 2 },
  tear: { height: 24, justifyContent: "center", backgroundColor: theme.palette.white },
  notch: { position: "absolute", width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.background },
  notchLeft: { left: -12 },
  notchRight: { right: -12 },
  dashes: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 22 },
  dash: { width: 6, height: 1.5, borderRadius: 1, backgroundColor: theme.palette.gray.quaternary },
  body: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 18, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  totalRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.palette.background.b3 },
  valueText: { flexShrink: 1, color: theme.palette.text.primary },
  foot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: theme.palette.background.b1,
    borderTopWidth: 1,
    borderTopColor: theme.palette.background.b3,
  },
  footText: { gap: 2 },
  mono: { letterSpacing: 1, color: theme.palette.text.primary },
  actions: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
}));
