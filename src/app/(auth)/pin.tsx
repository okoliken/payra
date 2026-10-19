import { useEffect, useState } from "react";
import { useGuardedRouter } from '@/lib/navigation';
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { Delete } from "lucide-react-native";
import { AppText, Screen } from "@/components/ui";
import { useStore } from "@/store/app-store";

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
  "",
  "0",
  "del",
] as const;

export default function EnterPinScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { signIn } = useStore();
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (pin.length < 6) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    signIn();
    const t = setTimeout(() => router.replace("/(tabs)"), 150);
    return () => clearTimeout(t);
  }, [pin, signIn, router]);

  const press = (k: string) => {
    Haptics.selectionAsync().catch(() => {});
    if (k === "del") return setPin((p) => p.slice(0, -1));
    setPin((p) => (p.length < 6 ? p + k : p));
  };

  return (
    <Screen>
      <View style={styles.top}>
        <AppText variant="h4" weight="semiBold">
          Enter your PIN
        </AppText>
        <AppText variant="body" tone="secondary" style={styles.sub}>
          Please enter your 6-digits PIN
        </AppText>
        <View style={styles.dots}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i < pin.length && styles.dotOn]}
            />
          ))}
        </View>
      </View>
      <View style={styles.pad}>
        {keys.map((k, i) => (
          <Pressable
            key={i}
            disabled={!k}
            onPress={() => press(k)}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          >
            {k === "del" ? (
              <Delete size={22} color={theme.colors.text} />
            ) : (
              <AppText variant="h3" weight="bold">
                {k}
              </AppText>
            )}
          </Pressable>
        ))}
      </View>
      <View style={styles.footer}>
        <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
          <AppText variant="body" tone="primary" weight="semiBold">
            Forgot my PIN
          </AppText>
        </Pressable>
        <Pressable onPress={() => router.replace("/(auth)/sign-in")}>
          <AppText variant="body" tone="primary" weight="semiBold">
            Log Out
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  top: { paddingTop: theme.spacing.xxxl * 2 },
  sub: { marginTop: theme.spacing.xs },
  dots: {
    flexDirection: "row",
    gap: theme.spacing.xxxx,
    justifyContent: "center",
    marginTop: theme.spacing.xxxxl,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 7,
    backgroundColor: theme.colors.fill.strong,
    fontWeight: "bold",
  },
  dotOn: { backgroundColor: theme.colors.brandDark },
  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: theme.spacing.xxxl,
    justifyContent: "center",
  },
  key: {
    width: "33.33%",
    height: 106,
    alignItems: "center",
    justifyContent: "center",
  },
  keyPressed: { opacity: 0.4 },
  footer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: theme.spacing.xxxl,
  },
}));
