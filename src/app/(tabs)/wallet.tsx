import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppText, Header, IconButton, Screen } from "@/components/ui";
import { AppIcon, type IconName } from "@/components/app-icon";
import { CardStack } from "@/components/card-stack";
import { useGuardedRouter } from "@/lib/navigation";
import { useStore } from "@/store/app-store";

/**
 * Figma "My Wallet" (402×874): nav 64 (title + 48pt `add` icon button) → 24 → card stack
 * (Mastercard strip 62pt above the Visa card, both 363.33×200 r24) → 32 → "Manage Wallet"
 * Body Large SemiBold → 16 → rows 370×84 (padding 18, gap 12, r18, B1) at gap 16, each with a
 * 40pt icon circle, Body SemiBold label and `alt-arrow-right` chevron.
 */
const rows: { key: string; label: string; icon: IconName; href: string }[] = [
  {
    key: "manage",
    label: "Manage Payment Method",
    icon: "settings",
    href: "/add-wallet",
  },
  {
    key: "show-pin",
    label: "Show PIN",
    icon: "eye",
    href: "/account-security",
  },
  {
    key: "unlock-pin",
    label: "Unlock PIN",
    icon: "lock",
    href: "/account-security",
  },
  { key: "replace", label: "Replace Card", icon: "card", href: "/add-wallet" },
  {
    key: "limit",
    label: "Card Limit",
    icon: "history",
    href: "/account-security",
  },
];

export default function WalletScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { cards } = useStore();

  return (
    <Screen scroll tabBarInset>
      <Header
        title="My Wallet"
        showBack={false}
        right={
          <IconButton size="lg" onPress={() => router.push("/add-wallet")}>
            <AppIcon name="add" size={24} color={theme.colors.brandDark} />
          </IconButton>
        }
      />

      <CardStack cards={cards} />

      <AppText variant="bodyL" weight="semiBold" style={styles.sectionTitle}>
        Manage Wallet
      </AppText>
      <View style={styles.list}>
        {rows.map((row) => (
          <Pressable
            key={row.key}
            onPress={() => router.push(row.href as never)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
          >
            <View style={styles.rowIcon}>
              <AppIcon
                name={row.icon}
                size={24}
                color={theme.colors.brandDark}
              />
            </View>
            <AppText variant="body" weight="semiBold" style={styles.rowLabel}>
              {row.label}
            </AppText>
            <AppIcon
              name="alt-arrow-right"
              size={24}
              color={theme.colors.brandDark}
            />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  sectionTitle: {
    marginTop: theme.spacing.xxxl,
    marginBottom: theme.spacing.lg,
  },
  list: { gap: theme.spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    height: 84,
    padding: 18,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceRaised,
  },
  rowPressed: { opacity: 0.8 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1 },
}));
