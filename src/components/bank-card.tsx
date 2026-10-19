import { View } from "react-native";
import { SvgXml } from "react-native-svg";
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

// Figma "payment gateway" component (Visa / Mastercard, 40.5×27.8), exported as SVG.
const visaSvg = `<svg width="41" height="28" viewBox="0 0 41 28" fill="none"><path d="M24.1182 8.01074C25.2683 8.01075 26.1986 8.26733 26.7852 8.5L26.3809 10.9834L26.1123 10.8613C25.5742 10.6288 24.8632 10.3963 23.8965 10.4209C22.7227 10.421 22.1958 10.9227 22.1836 11.4121C22.1836 11.9505 22.8213 12.3049 23.8613 12.8311C25.5745 13.6508 26.3693 14.6547 26.3574 15.9639C26.3331 18.3494 24.3015 19.8906 21.1816 19.8906C19.8478 19.8783 18.5627 19.597 17.8652 19.2793L18.2812 16.6973L18.6729 16.8809C19.6396 17.3095 20.2757 17.4932 21.4629 17.4932C22.319 17.4932 23.2373 17.1376 23.249 16.3672C23.249 15.8656 22.8575 15.4983 21.707 14.9355C20.5815 14.3848 19.0762 13.4672 19.1006 11.8154C19.1133 9.57665 21.1816 8.01074 24.1182 8.01074ZM16.0068 19.7197H13.0332L14.8926 8.21875H17.8662L16.0068 19.7197ZM36.8086 19.7197H34.0557C34.0557 19.7197 33.7856 18.3979 33.7002 17.9941H29.8828C29.7724 18.2998 29.2588 19.7197 29.2588 19.7197H26.1387L30.5557 9.17383C30.8617 8.42747 31.4001 8.21876 32.1094 8.21875H34.4092L36.8086 19.7197ZM13.6934 8.21875L9.01953 19.707H5.875L3.20703 9.65039C5.09128 10.6418 6.7799 12.6356 7.31836 14.4707L7.63672 16.0615L10.5488 8.21875H13.6934ZM31.9258 12.4277C31.9162 12.4537 30.9829 14.9882 30.7393 15.6455H33.2109C33.0887 15.0705 32.5254 12.3174 32.5254 12.3174L32.3174 11.3262C32.1754 11.7401 31.9307 12.4062 31.9258 12.4277Z" fill="currentColor"/><path d="M9.80859 10.499H6.49194L6.45801 10.6601C9.0452 11.3218 10.7587 12.9167 11.4626 14.8338L10.7416 11.1693C10.6229 10.66 10.2581 10.5158 9.80859 10.499Z" fill="#FAA61A"/></svg>`;
const mastercardSvg = `<svg width="41" height="28" viewBox="0 0 41 28" fill="none"><path d="M27.5225 2.89453C33.4636 2.89474 38.2793 7.76722 38.2793 13.7773C38.2791 19.7873 33.4635 24.659 27.5225 24.6592C24.8587 24.6592 22.4228 23.6779 20.5439 22.0557C18.6652 23.6777 16.23 24.6591 13.5664 24.6592C7.62522 24.6592 2.80875 19.7875 2.80859 13.7773C2.80859 7.76709 7.62512 2.89453 13.5664 2.89453C16.2299 2.89457 18.6652 3.87609 20.5439 5.49805C22.4227 3.87593 24.8588 2.89453 27.5225 2.89453Z" fill="#ED0006"/><path d="M27.5215 2.89453C33.4628 2.89453 38.2793 7.76709 38.2793 13.7773C38.2791 19.7875 33.4627 24.6592 27.5215 24.6592C24.858 24.6591 22.4226 23.6777 20.5439 22.0557C22.8557 20.0597 24.3232 17.0929 24.3232 13.7773C24.3232 10.4616 22.8559 7.49409 20.5439 5.49805C22.4226 3.87607 24.8581 2.89463 27.5215 2.89453Z" fill="#F9A000"/><path d="M20.5439 5.49805C22.8561 7.49409 24.3242 10.4614 24.3242 13.7773C24.3242 17.093 22.8558 20.0596 20.5439 22.0557C18.2323 20.0596 16.7646 17.0928 16.7646 13.7773C16.7646 10.4616 18.2321 7.49409 20.5439 5.49805Z" fill="#FF5E00"/></svg>`;

function VisaMark({ onDark }: { onDark: boolean }) {
  return <SvgXml xml={visaSvg} width={41} height={28} color={onDark ? "#FFFFFF" : "#0B4647"} />;
}

function MastercardMark() {
  return <SvgXml xml={mastercardSvg} width={41} height={28} />;
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
}));
