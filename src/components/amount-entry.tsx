import { useState } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { Delete } from "lucide-react-native";
import { AppText, Avatar, Button, Card } from "@/components/ui";
import type { Contact } from "@/data/mock";
import { formatMoney } from "@/lib/format";

const keys = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ".",
  "0",
  "del",
] as const;
const quick = [10, 25, 50, 100];

type Props = {
  contact: Contact;
  cta: string;
  max?: number;
  onSubmit: (amount: number) => void;
};

/** Shared amount keypad for Transfer / Request. */
export function AmountEntry({ contact, cta, max, onSubmit }: Props) {
  const { theme } = useUnistyles();
  const [raw, setRaw] = useState("0");
  const amount = Number(raw) || 0;
  const overMax = max !== undefined && amount > max;

  const press = (k: string) => {
    Haptics.selectionAsync().catch(() => {});
    setRaw((r) => {
      if (k === "del") return r.length > 1 ? r.slice(0, -1) : "0";
      if (k === ".") return r.includes(".") ? r : r + ".";
      if (r === "0") return k;
      const [, dec] = r.split(".");
      if (dec && dec.length >= 2) return r;
      return r.length < 9 ? r + k : r;
    });
  };

  return (
    <View style={styles.root}>
      <Card style={styles.who}>
        <Avatar name={contact.name} />
        <View>
          <AppText variant="body" weight="semiBold">
            {contact.name}
          </AppText>
          <AppText variant="captionL" tone="secondary">
            {contact.phone}
          </AppText>
        </View>
      </Card>
      <View style={styles.amountWrap}>
        <AppText
          variant="display"
          weight="semiBold"
          tone={overMax ? "danger" : "primary"}
          align="center"
        >
          ${raw}
        </AppText>
        {max !== undefined ? (
          <AppText
            variant="captionL"
            tone={overMax ? "danger" : "secondary"}
            align="center"
          >
            Available balance {formatMoney(max)}
          </AppText>
        ) : null}
      </View>
      <View style={styles.quick}>
        {quick.map((q) => (
          <Pressable
            key={q}
            onPress={() => setRaw(String(q))}
            style={styles.chip}
          >
            <AppText variant="captionL" weight="semiBold">
              ${q}
            </AppText>
          </Pressable>
        ))}
      </View>
      <View style={styles.pad}>
        {keys.map((k) => (
          <Pressable
            key={k}
            onPress={() => press(k)}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          >
            {k === "del" ? (
              <Delete size={22} color={theme.colors.text} />
            ) : (
              <AppText variant="h4" weight="medium">
                {k}
              </AppText>
            )}
          </Pressable>
        ))}
      </View>
      <Button
        title={cta}
        disabled={amount <= 0 || overMax}
        onPress={() => onSubmit(amount)}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1 },
  who: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  amountWrap: {
    flex: 1,
    justifyContent: "center",
    gap: theme.spacing.xs,
    minHeight: 96,
  },
  quick: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
    justifyContent: "center",
  },
  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.md,
  },
  key: {
    width: "33.33%",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  keyPressed: { opacity: 0.4 },
}));
