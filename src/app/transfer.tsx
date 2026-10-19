import { Image, Pressable, View } from "react-native";
import { SvgXml } from "react-native-svg";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { PressableScale } from "@/components/pressable-scale";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppText, Header, IconCircle, Screen } from "@/components/ui";
import { AppIcon, type IconName } from "@/components/app-icon";
import { useGuardedRouter } from "@/lib/navigation";
import { frequentTransfers } from "@/data/mock";

/** The "Payra Users" glyph in Figma is the logo mark with a white dot (24×19). */
const payraMark = `<svg width="24" height="19" viewBox="0 0 24 19" fill="none"><path d="M0 14.4083V0L17.9221 3.72151e-05L24 6.01669V19H4.51948L0 14.4083Z" fill="#0B4647"/><path d="M8.1039 4.17267C8.88919 3.17358 10.0982 2.53337 11.4545 2.53337C13.8215 2.53337 15.7403 4.48279 15.7403 6.88752C15.7403 9.29226 13.8215 11.2417 11.4545 11.2417C10.0982 11.2417 8.88919 10.6014 8.1039 9.60222V14.4083H4.51948V2.53337H8.1039V4.17267Z" fill="#ECF0AF"/><path d="M15.4286 11.875H17.9221V14.4083H15.4286V11.875Z" fill="#FAFAFA"/></svg>`;

const targets: { label: string; icon?: IconName }[] = [
  { label: "Bank", icon: "bank" },
  { label: "E-Wallet", icon: "wallet-money-bold" },
  { label: "Virtual Account", icon: "notes-bold" },
  { label: "Payra Users" },
];

const avatars = [
  require("@/../assets/images/avatar-1.png"),
  require("@/../assets/images/avatar-2.png"),
  require("@/../assets/images/avatar-3.png"),
];

/** Figma "Request" (563:1388), titled Transfer: three r24 cards, 24 apart. */
export default function TransferScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const pickContact = (params: { via?: string; search?: string } = {}) =>
    router.push({ pathname: "/select-contact", params });

  return (
    <Screen scroll>
      <Header title="Transfer" />
      <View style={styles.cards}>
        <View style={styles.card}>
          <View style={styles.gap8}>
            <AppText variant="bodyL" weight="semiBold" style={styles.black}>
              To Your Account
            </AppText>
            <AppText variant="captionL" tone="secondary">
              Transfer funds to your own wallet instantly and securely
            </AppText>
          </View>
          <Pressable
            style={styles.smallButton}
            onPress={() => router.push({ pathname: "/send-amount", params: { mode: "topup" } })}
          >
            <AppText variant="captionL" weight="semiBold" tone="onBrand">
              Add
            </AppText>
            <AppIcon name="add" size={16} color={theme.colors.brandDark} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <AppText variant="bodyL" weight="semiBold" style={styles.black}>
            Transfer to Others
          </AppText>
          <View style={styles.targets}>
            {targets.map((t) => (
              <Target
                key={t.label}
                label={t.label}
                // Payra Users are people in your contacts; the others need an account number.
                onPress={() =>
                  t.icon ? router.push({ pathname: "/recipient", params: { method: t.label } }) : pickContact({ via: t.label })
                }
              >
                {t.icon ? (
                  <AppIcon name={t.icon} size={24} color={theme.colors.text} />
                ) : (
                  <SvgXml xml={payraMark} width={24} height={19} />
                )}
              </Target>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <AppText variant="bodyL" weight="semiBold" style={styles.black}>
            Frequent Transfers
          </AppText>
          <Pressable style={styles.search} onPress={() => pickContact({ search: "1" })}>
            <AppIcon name="search" size={18} color={theme.colors.text} />
            <AppText variant="captionL" tone="secondary">
              Search by name or phone number
            </AppText>
          </Pressable>
          {frequentTransfers.map((c) => (
            <Pressable
              key={c.id}
              style={styles.frequent}
              onPress={() => router.push({ pathname: "/send-amount", params: { contactId: c.id, via: c.bank } })}
            >
              <IconCircle size="md">
                <AppText variant="captionL" weight="semiBold" style={styles.black}>
                  JD
                </AppText>
              </IconCircle>
              <View style={styles.gap6}>
                <AppText variant="captionL" weight="semiBold">
                  {c.name}
                </AppText>
                <View style={styles.row6}>
                  <AppText variant="captionS" tone="secondary">
                    {c.bank}
                  </AppText>
                  <AppText variant="captionS" tone="secondary">
                    {c.account}
                  </AppText>
                </View>
              </View>
            </Pressable>
          ))}
          <View style={styles.divider} />
          <View style={styles.footer}>
            <View style={styles.avatars}>
              {avatars.map((src, i) => (
                <View key={i} style={i > 0 && styles.overlap}>
                  <IconCircle size="sm">
                    <Image source={src} style={styles.avatar} />
                  </IconCircle>
                </View>
              ))}
            </View>
            <Pressable style={[styles.smallButton, styles.viewAll]} onPress={() => pickContact()}>
              <AppText variant="captionL" weight="semiBold" tone="onBrand">
                View All Contacts
              </AppText>
              <AppIcon name="arrow-right" size={16} color={theme.colors.brandDark} />
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}

/**
 * A "Transfer to Others" option. Under the finger it compresses; on release a ring ripples out
 * of the icon and the next screen opens a beat later, so the tap visibly lands.
 */
function Target({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  const ripple = useSharedValue(0);
  const ring = useAnimatedStyle(() => ({
    opacity: interpolate(ripple.value, [0, 0.15, 1], [0, 0.45, 0]),
    transform: [{ scale: 1 + ripple.value * 0.55 }],
  }));
  return (
    <PressableScale
      style={styles.target}
      scale={0.9}
      onPress={() => {
        ripple.set(0);
        ripple.set(withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }));
        setTimeout(onPress, 140);
      }}
    >
      <View>
        <Animated.View style={[styles.ripple, ring]} />
        <IconCircle>{children}</IconCircle>
      </View>
      <AppText variant="captionS" style={styles.black}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create((theme) => ({
  cards: { gap: 24 },
  card: {
    gap: 24,
    padding: 18,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceRaised,
  },
  black: { color: theme.palette.black },
  gap6: { gap: 6 },
  gap8: { gap: 8 },
  row6: { flexDirection: "row", gap: 6 },
  // Figma Primary / Small / Icon right: 36 tall, padding 12, gap 8, r24.
  smallButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 36,
    marginTop: -6,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: theme.colors.brand,
  },
  // Same 87.5pt columns as Home's Other Payment.
  targets: { flexDirection: "row", marginHorizontal: -8 },
  target: { flex: 1, alignItems: "center", gap: 8 },
  ripple: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.brandDark,
  },
  // Figma Search Bar / Default: 42 tall, Background/B0, 6% stroke, r12, padding 12/16, gap 12.
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
    backgroundColor: theme.colors.background,
  },
  frequent: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 6 },
  divider: { height: 1, backgroundColor: theme.colors.stroke.soft },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  avatars: { flexDirection: "row" },
  overlap: { marginLeft: -10 },
  avatar: { width: 28, height: 28 },
  viewAll: { marginTop: 0 },
}));
