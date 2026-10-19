import { View } from "react-native";
import { useGuardedRouter } from "@/lib/navigation";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import {
  ArrowRight,
  Building2,
  Landmark,
  Plus,
  Search,
  Users,
  Wallet,
} from "lucide-react-native";
import {
  AppText,
  Avatar,
  Button,
  Card,
  Header,
  Input,
  Screen,
} from "@/components/ui";
import { frequentTransfers } from "@/data/mock";

const targets = [
  { key: "bank", label: "Bank", Icon: Landmark },
  { key: "ewallet", label: "E-Wallet", Icon: Wallet },
  { key: "virtual", label: "Virtual Account", Icon: Building2 },
  { key: "payra", label: "Payra Users", Icon: Users },
] as const;

export default function TransferScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const goPick = () =>
    router.push({
      pathname: "/select-contact",
      params: { next: "send-amount" },
    });

  return (
    <Screen>
      <Header title="Transfer" />
      <Card style={styles.block}>
        <AppText variant="body" weight="semiBold">
          To Your Account
        </AppText>
        <AppText variant="captionL" tone="secondary">
          Transfer funds to your own wallet instantly and securely
        </AppText>
        <Button
          title="Add"
          size="md"
          icon={<Plus size={14} color={theme.colors.onBrand} />}
          onPress={() => router.push("/top-up")}
        />
      </Card>

      <Card style={styles.block}>
        <AppText variant="body" weight="semiBold">
          Transfer to Others
        </AppText>
        <View style={styles.targets}>
          {targets.map(({ key, label, Icon }) => (
            <View key={key} style={styles.target}>
              <View style={styles.targetIcon} onTouchEnd={goPick}>
                <Icon size={18} color={theme.colors.text} />
              </View>
              <AppText variant="captionS" tone="secondary" align="center">
                {label}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.block}>
        <AppText variant="body" weight="semiBold">
          Frequent Transfers
        </AppText>
        <Input
          placeholder="Search by name or phone number"
          left={<Search size={16} color={theme.colors.textSecondary} />}
          onFocus={goPick}
        />
        {frequentTransfers.map((c) => (
          <View key={c.id} style={styles.frequent}>
            <Avatar name={c.name} size="sm" />
            <View>
              <AppText variant="body" weight="semiBold">
                {c.name}
              </AppText>
              <AppText variant="captionL" tone="secondary">
                {c.bank} · {c.account}
              </AppText>
            </View>
          </View>
        ))}
        <View style={styles.footer}>
          <View style={styles.avatars}>
            {["Aaliyah Putri", "Bima Andika", "Chandra Wijaya"].map((n, i) => (
              <View
                key={n}
                style={[styles.avatarWrap, { marginLeft: i ? -10 : 0 }]}
              >
                <Avatar name={n} size="sm" />
              </View>
            ))}
          </View>
          <Button
            title="View All Contacts"
            size="sm"
            fullWidth={false}
            icon={<ArrowRight size={14} color={theme.colors.onBrand} />}
            onPress={goPick}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  block: { gap: theme.spacing.md, marginBottom: theme.spacing.md },
  targets: { flexDirection: "row", justifyContent: "space-between" },
  target: { alignItems: "center", gap: 6, width: 72 },
  targetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  frequent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: theme.colors.stroke.soft,
    paddingTop: theme.spacing.md,
  },
  avatars: { flexDirection: "row" },
  avatarWrap: {
    borderWidth: 2,
    borderColor: theme.colors.surface,
    borderRadius: 16,
  },
}));
