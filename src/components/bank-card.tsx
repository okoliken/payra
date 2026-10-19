import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { AppText } from "@/components/ui";
import type { Card as CardModel } from "@/data/mock";
import { formatMoney } from "@/lib/format";

/**
 * Figma card tile (My Wallet): 363.33×200, r24, Brand/Secondary (Visa) or Brand/Primary (Mastercard).
 * Measured positions inside the card: brand mark top-left at (26.67, 20); type label Caption 12/17
 * right-aligned with a 28.9 right inset at y=20; number row at y≈87 — three groups of four 6.67pt
 * dots (gap 7) and the last four digits in Heading H4 Regular 20/28; bottom row at y≈157 —
 * balance Body Large SemiBold left, expiry Body SemiBold right. `compact` renders only the top strip.
 */
export function BankCard({
  card,
  compact = false,
  placeholder = false,
}: {
  card: CardModel;
  compact?: boolean;
  placeholder?: boolean;
}) {
  styles.useVariants({ tone: card.tone, compact });
  const onDark = card.tone === "dark";
  const tone = onDark ? "onDark" : "onBrand";
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        {card.brand === "visa" ? (
          <VisaMark onDark={onDark} />
        ) : (
          <MastercardMark />
        )}
        <AppText variant="captionL" tone={tone}>
          {card.type}
        </AppText>
      </View>
      {!compact ? (
        <>
          <View style={styles.number}>
            {[0, 1, 2].map((g) => (
              <View key={g} style={styles.dotGroup}>
                {[0, 1, 2, 3].map((d) => (
                  <View
                    key={d}
                    style={[
                      styles.dot,
                      { backgroundColor: onDark ? "#FFFFFF" : "#0B4647" },
                    ]}
                  />
                ))}
              </View>
            ))}
            <AppText variant="h4" tone={tone}>
              {placeholder ? "0000" : card.last4}
            </AppText>
          </View>
          <View style={styles.bottom}>
            <AppText variant="bodyL" weight="semiBold" tone={tone}>
              {formatMoney(card.balance)}
            </AppText>
            <AppText variant="body" weight="semiBold" tone={tone}>
              {placeholder ? "MM / YY" : card.expiry}
            </AppText>
          </View>
        </>
      ) : null}
    </View>
  );
}

// TODO(figma-assets): replace with the Figma "payment gateway" Visa vector once its SVG is pasted.
function VisaMark({ onDark }: { onDark: boolean }) {
  return (
    <AppText
      variant="bodyL"
      weight="bold"
      tone={onDark ? "onDark" : "onBrand"}
      style={styles.visa}
    >
      VISA
    </AppText>
  );
}

// TODO(figma-assets): replace with the Figma "payment gateway" Mastercard vector (FF5E00 / EB001B).
function MastercardMark() {
  return (
    <View style={styles.mc}>
      <View style={[styles.mcCircle, { backgroundColor: "#EB001B" }]} />
      <View style={[styles.mcCircle, styles.mcRight]} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    alignSelf: "stretch",
    marginHorizontal: 3.33,
    borderRadius: 24,
    paddingTop: 20,
    paddingLeft: 26.67,
    paddingRight: 28.9,
    variants: {
      tone: {
        dark: { backgroundColor: theme.colors.brandDark },
        yellow: { backgroundColor: theme.colors.brand },
      },
      compact: {
        true: {
          height: 62.22 + 24,
          overflow: "hidden",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },
        false: { height: 200 },
      },
    },
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 28,
  },
  number: {
    position: "absolute",
    left: 36.67,
    top: 86.67,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  dotGroup: { flexDirection: "row", gap: 7 },
  dot: { width: 6.67, height: 6.67, borderRadius: 3.335 },
  bottom: {
    position: "absolute",
    left: 26.67,
    right: 28.9,
    top: 156.67,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  visa: { fontStyle: "italic", letterSpacing: 1 },
  mc: { flexDirection: "row", alignItems: "center" },
  mcCircle: { width: 28.62, height: 28.62, borderRadius: 14.31 },
  mcRight: { backgroundColor: "#FF5E00", marginLeft: -12, opacity: 0.95 },
}));
