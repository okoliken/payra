import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppText, Header, IconButton, IconCircle, Screen } from "@/components/ui";
import { AppIcon, type IconName } from "@/components/app-icon";
import { CardStack } from "@/components/card-stack";
import * as Haptics from "expo-haptics";
import { useStore } from "@/store/app-store";

/**
 * Figma "My Wallet" (402×874): nav 64 (title + 48pt `add` icon button) → 24 → card stack
 * (Mastercard strip 62pt above the Visa card, both 363.33×200 r24) → 32 → "Manage Wallet"
 * Body Large SemiBold → 16 → rows 370×84 (padding 18, gap 12, r18, B1) at gap 16, each with a
 * 48pt IconCircle, Body SemiBold label and `alt-arrow-right` chevron.
 */
const rows: { key: string; label: string; icon: IconName }[] = [
  {
    key: "manage",
    label: "Manage Payment Method",
    icon: "settings" },
  {
    key: "show-pin",
    label: "Show PIN",
    icon: "eye" },
  {
    key: "unlock-pin",
    label: "Unlock PIN",
    icon: "lock" },
  { key: "replace", label: "Replace Card", icon: "card" },
  {
    key: "limit",
    label: "Card Limit",
    icon: "history" },
];

export default function WalletScreen() {
  const { theme } = useUnistyles();
  const { cards } = useStore();

  return (
    <Screen scroll tabBarInset>
      <Header
        title="My Wallet"
        showBack={false}
        right={
          <IconButton size="lg" onPress={() => Haptics.selectionAsync().catch(() => {})}>
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
            onPress={() => Haptics.selectionAsync().catch(() => {})}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
          >
            <IconCircle>
              <AppIcon name={row.icon} size={24} color={theme.colors.text} />
            </IconCircle>
            <AppText variant="body" weight="semiBold" style={styles.rowLabel}>
              {row.label}
            </AppText>
            <AppIcon name="alt-arrow-right" size={24} color={theme.colors.text} />
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
  rowLabel: { flex: 1 },
}));
