import { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText, Button, Header, IconCircle, Screen } from "@/components/ui";
import { AppIcon } from "@/components/app-icon";
import { PressableScale } from "@/components/pressable-scale";
import { useGuardedRouter } from "@/lib/navigation";
import { initials } from "@/lib/format";
import { lookupAccount, providers, type Provider } from "@/data/mock";

type Method = "Bank" | "E-Wallet" | "Virtual Account";

const copy: Record<Method, { pick?: string; label: string; placeholder: string; min: number }> = {
  Bank: { pick: "Choose Bank", label: "Account Number", placeholder: "Enter account number", min: 10 },
  "E-Wallet": { pick: "Choose E-Wallet", label: "Phone Number", placeholder: "Enter phone number", min: 10 },
  "Virtual Account": { label: "Virtual Account Number", placeholder: "Enter virtual account number", min: 12 },
};

type Lookup = { state: "idle" } | { state: "checking" } | { state: "found"; name: string };

/**
 * Not in Figma: where Bank / E-Wallet / Virtual Account transfers start. Pick a provider, type the
 * number, and the account holder's name is looked up as you type (simulated): a pulsing skeleton
 * while it checks, then the name springs in with a check. Continue goes straight to the amount.
 */
export default function RecipientScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { method: rawMethod } = useLocalSearchParams<{ method: Method }>();
  const method: Method = rawMethod in copy ? rawMethod : "Bank";
  const text = copy[method];
  const list = method === "Virtual Account" ? [] : providers[method];

  const [provider, setProvider] = useState<Provider | undefined>(list[0]);
  const [number, setNumber] = useState("");
  // The lookup belongs to one provider + number; editing either makes the old result stale.
  const ready = number.length >= text.min && (list.length === 0 || provider);
  const key = ready ? `${provider?.id ?? "va"}:${number}` : "";
  const [checking, setChecking] = useState("");
  const [found, setFound] = useState<{ key: string; name: string }>();
  useEffect(() => {
    if (!key) return;
    const start = setTimeout(() => setChecking(key), 250);
    const done = setTimeout(() => {
      setFound({ key, name: lookupAccount(key) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, 1150);
    return () => {
      clearTimeout(start);
      clearTimeout(done);
    };
  }, [key]);
  const lookup: Lookup = !key
    ? { state: "idle" }
    : found?.key === key
      ? { state: "found", name: found.name }
      : checking === key
        ? { state: "checking" }
        : { state: "idle" };

  const detail = [provider?.name ?? "Virtual Account", number].join(" · ");

  return (
    <Screen>
      <Header title={method} />
      <KeyboardAvoidingView behavior="padding" style={styles.fill} keyboardVerticalOffset={-24}>
        <View style={styles.fill}>
          {list.length > 0 ? (
            <>
              <AppText variant="bodyL" weight="semiBold" style={styles.sectionTitle}>
                {text.pick}
              </AppText>
              <View style={styles.providers}>
                {list.map((p) => (
                  <ProviderTile key={p.id} provider={p} selected={p.id === provider?.id} onPress={() => setProvider(p)} />
                ))}
              </View>
            </>
          ) : null}

          <View style={styles.field}>
            <AppText variant="body" weight="semiBold">
              {text.label}
            </AppText>
            <TextInput
              value={number}
              onChangeText={(t) => setNumber(t.replace(/\D/g, "").slice(0, 16))}
              placeholder={text.placeholder}
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="number-pad"
              autoFocus
              style={styles.input}
            />
          </View>

          <View style={styles.lookup}>
            {lookup.state === "checking" ? <Skeleton /> : null}
            {lookup.state === "found" ? (
              <Animated.View entering={FadeInDown.duration(320).easing(Easing.out(Easing.cubic))} style={styles.found}>
                <IconCircle>
                  <AppText variant="captionL" weight="semiBold" style={styles.black}>
                    {initials(lookup.name)}
                  </AppText>
                </IconCircle>
                <View style={styles.foundText}>
                  <AppText variant="body" weight="semiBold">
                    {lookup.name}
                  </AppText>
                  <AppText variant="captionL" tone="secondary">
                    {detail}
                  </AppText>
                </View>
                <Animated.View entering={ZoomIn.delay(160).springify().damping(10)} style={styles.check}>
                  <AppIcon name="check" size={14} color={theme.colors.surfaceRaised} />
                </Animated.View>
              </Animated.View>
            ) : null}
            {lookup.state === "idle" && number.length > 0 ? (
              <Animated.View entering={FadeIn.duration(200)}>
                <AppText variant="captionL" tone="secondary">
                  {text.min - number.length > 0 ? `${text.min - number.length} more digits to check the name` : " "}
                </AppText>
              </Animated.View>
            ) : null}
          </View>
        </View>

        <Button
          title="Continue"
          disabled={lookup.state !== "found"}
          onPress={() =>
            lookup.state === "found" &&
            router.push({ pathname: "/send-amount", params: { name: lookup.name, detail, via: method } })
          }
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** Logo tile; the chosen one pops and gets a Brand/Secondary ring. */
function ProviderTile({ provider, selected, onPress }: { provider: Provider; selected: boolean; onPress: () => void }) {
  const { theme } = useUnistyles();
  const p = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    p.value = selected ? withSpring(1, { damping: 12, stiffness: 220 }) : withTiming(0, { duration: 160 });
  }, [selected, p]);
  const ring = useAnimatedStyle(() => ({
    borderColor: selected ? theme.colors.brandDark : "transparent",
    transform: [{ scale: 0.92 + 0.08 * p.value }],
  }));
  return (
    <PressableScale style={styles.tile} onPress={onPress}>
      <Animated.View style={[styles.ring, ring]}>
        <Image source={provider.logo} style={styles.logo} />
      </Animated.View>
      <AppText variant="captionL" weight={selected ? "semiBold" : "regular"} tone={selected ? "primary" : "secondary"}>
        {provider.name}
      </AppText>
    </PressableScale>
  );
}

/** Pulsing placeholder in the shape of the result row while the name is being checked. */
function Skeleton() {
  const o = useSharedValue(0.5);
  useEffect(() => {
    o.value = withRepeat(withTiming(1, { duration: 550, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [o]);
  const pulse = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View entering={FadeIn.duration(150)} style={[styles.found, pulse]}>
      <View style={styles.skCircle} />
      <View style={styles.foundText}>
        <View style={[styles.skBar, { width: 140 }]} />
        <View style={[styles.skBar, { width: 200, height: 10 }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  fill: { flex: 1 },
  sectionTitle: { marginBottom: 16 },
  providers: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceRaised,
  },
  tile: { flex: 1, alignItems: "center", gap: 8 },
  ring: { padding: 3, borderRadius: 30, borderWidth: 2 },
  logo: { width: 48, height: 48 },
  // Figma Input: label Body SemiBold → 8 → 48pt field, r12, Background/B2, 6% stroke, padding 16.
  field: { gap: 8 },
  input: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
    backgroundColor: theme.colors.field,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body.fontSize,
  },
  lookup: { marginTop: 16, minHeight: 84 },
  found: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceRaised,
  },
  foundText: { flex: 1, gap: 6 },
  black: { color: theme.palette.black },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.success,
  },
  skCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.surfaceMuted },
  skBar: { height: 12, borderRadius: 6, backgroundColor: theme.colors.surfaceMuted },
}));
