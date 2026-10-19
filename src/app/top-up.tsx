import { useState } from "react";
import { useGuardedRouter } from '@/lib/navigation';
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import {
  ArrowRight,
  Banknote,
  CreditCard,
  Info,
  Landmark,
} from "lucide-react-native";
import { AppText, Button, Card, Header, Input, Screen } from "@/components/ui";
import { topUpBanks } from "@/data/mock";
import { useStore } from "@/store/app-store";

export default function TopUpScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { addTransaction } = useStore();
  const [method, setMethod] = useState("BCA");
  const [amount, setAmount] = useState("50");
  const value = Number(amount) || 0;

  return (
    <Screen>
      <Header title="Top Up" />
      <View style={styles.notice}>
        <Info size={14} color={theme.colors.onBrand} />
        <AppText variant="captionL" tone="onBrand" style={styles.noticeText}>
          Free monthly top up fee, minimum top-up $5 at selected merchants.
        </AppText>
      </View>

      {topUpBanks.map((group, gi) => (
        <Card key={gi} style={styles.block}>
          <AppText variant="body" weight="semiBold">
            {gi === 0 ? "Via card & e-banking" : "Via bank"}
          </AppText>
          <AppText variant="captionL" tone="secondary">
            Top up via ATM, mobile & internet banking.
          </AppText>
          <View style={styles.grid}>
            {group.map((name) => {
              const active = method === name;
              const Icon = gi === 0 ? CreditCard : Landmark;
              return (
                <Pressable
                  key={name}
                  onPress={() => setMethod(name)}
                  style={styles.method}
                >
                  <View
                    style={[
                      styles.methodIcon,
                      active && styles.methodIconActive,
                    ]}
                  >
                    <Icon
                      size={18}
                      color={
                        active ? theme.colors.onBrandDark : theme.colors.text
                      }
                    />
                  </View>
                  <AppText
                    variant="captionS"
                    tone="secondary"
                    align="center"
                    numberOfLines={2}
                  >
                    {name}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <Button
            title="See more methods"
            size="sm"
            fullWidth={false}
            icon={<ArrowRight size={14} color={theme.colors.onBrand} />}
            onPress={() => {}}
            style={styles.more}
          />
        </Card>
      ))}

      <Card style={styles.block}>
        <View style={styles.cashRow}>
          <Banknote size={18} color={theme.colors.text} />
          <AppText variant="body" weight="semiBold">
            Amount
          </AppText>
        </View>
        <Input
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          left={
            <AppText variant="body" weight="semiBold">
              $
            </AppText>
          }
        />
        <Button
          title={`Top up $${value.toFixed(2)} via ${method}`}
          disabled={value < 5}
          onPress={() => {
            addTransaction({
              title: "Top Up",
              kind: "topup",
              amount: value,
              category: method,
            });
            router.replace({
              pathname: "/success",
              params: {
                title: "Top Up Successful!",
                body: `$${value.toFixed(2)} has been added to your balance.`,
              },
            });
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand,
    marginBottom: theme.spacing.md,
  },
  noticeText: { flex: 1 },
  block: { gap: theme.spacing.md, marginBottom: theme.spacing.md },
  grid: { flexDirection: "row", justifyContent: "space-between" },
  method: { width: 72, alignItems: "center", gap: 6 },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  methodIconActive: { backgroundColor: theme.colors.brandDark },
  more: { alignSelf: "flex-end" },
  cashRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
}));
