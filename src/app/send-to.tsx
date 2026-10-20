import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, { Easing, FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText, Header, IconCircle, Screen, SearchBar } from "@/components/ui";
import { AppIcon } from "@/components/app-icon";
import { ReviewSheet } from "@/components/review-sheet";
import { Tappable } from "@/components/tappable";
import { formatMoney, initials } from "@/lib/format";
import { EASE, fade, rise } from "@/lib/motion";
import { banks, beneficiaries, lookupAccount, recipientDetail, type Provider, type Recipient } from "@/data/mock";
import { useStore } from "@/store/app-store";

const MIN_ACCOUNT = 10;
const layout = LinearTransition.duration(220).easing(EASE);

/**
 * Step 2 of sending: who. One field takes a name, phone or account number. Empty, it shows
 * Recent and Beneficiaries; a name filters them; digits turn it into an account transfer:
 * suggested banks appear, then the holder's name is looked up. Picking anyone opens Review.
 */
export default function SendToScreen() {
  const { theme } = useUnistyles();
  const { amount: rawAmount } = useLocalSearchParams<{ amount: string }>();
  const amount = Number(rawAmount) || 0;
  const transactions = useStore((s) => s.transactions);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Recipient>();

  const digits = query.replace(/[\s-]/g, "");
  const isAccount = /^\d{4,}$/.test(digits);
  const q = query.trim().toLowerCase();

  // Most recent people you sent to, newest first, then fill up from saved beneficiaries.
  const recent = useMemo(() => {
    const names = transactions.filter((t) => t.kind === "sent").map((t) => t.category);
    const ordered = [...new Set(names)].map((n) => beneficiaries.find((b) => b.name === n)).filter((b): b is Recipient => !!b);
    return [...new Set([...ordered, ...beneficiaries])].slice(0, 6);
  }, [transactions]);

  const matches = useMemo(
    () =>
      !q
        ? beneficiaries
        : beneficiaries.filter((b) => b.name.toLowerCase().includes(q) || b.account.replace(/\D/g, "").includes(digits)),
    [q, digits],
  );

  return (
    // The list scrolls under the home indicator; its own bottom padding keeps the last row clear.
    <Screen style={styles.screen}>
      <Header title={`Send ${formatMoney(amount)}`} />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Name, phone or account number" autoCapitalize="words" />

      <ScrollView style={styles.fill} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {isAccount ? (
          <AccountTransfer key="account" number={digits} onPick={setPicked} />
        ) : (
          <Animated.View key="people" entering={fade()} layout={layout} style={styles.sections}>
            {!q ? (
              <View style={styles.section}>
                <AppText variant="bodyL" weight="semiBold">
                  Recent
                </AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recent}>
                  {recent.map((r) => (
                    <Tappable key={r.name} style={styles.recentItem} accessibilityLabel={`Send to ${r.name}`} onPress={() => setPicked(r)}>
                      <Avatar recipient={r} />
                      <AppText variant="captionL" numberOfLines={1}>
                        {r.name.split(" ")[0]}
                      </AppText>
                    </Tappable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.section}>
              <AppText variant="bodyL" weight="semiBold">
                Beneficiaries
              </AppText>
              <Animated.View layout={layout} style={styles.list}>
                {matches.length === 0 ? (
                  <AppText variant="body" tone="secondary" align="center" style={styles.empty}>
                    No one matches “{query.trim()}”
                  </AppText>
                ) : (
                  matches.map((b, i) => (
                    <Animated.View key={b.name} entering={fade()} exiting={FadeOut.duration(120)} layout={layout}>
                      {i > 0 ? <View style={styles.divider} /> : null}
                      <Tappable style={styles.row} accessibilityLabel={`${b.name}, ${recipientDetail(b)}`} onPress={() => setPicked(b)}>
                        <Avatar recipient={b} />
                        <View style={styles.rowText}>
                          <AppText variant="body" weight="semiBold">
                            {b.name}
                          </AppText>
                          <AppText variant="captionL" tone="secondary">
                            {recipientDetail(b)}
                          </AppText>
                        </View>
                        <AppIcon name="alt-arrow-right" size={20} color={theme.colors.textTertiary} />
                      </Tappable>
                    </Animated.View>
                  ))
                )}
              </Animated.View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <ReviewSheet visible={!!picked} onClose={() => setPicked(undefined)} amount={amount} recipient={picked} />
    </Screen>
  );
}

/** Initials in the Figma double circle; bank accounts carry a small bank badge. */
function Avatar({ recipient }: { recipient: Recipient }) {
  const logo = recipient.channel === "Bank" ? banks.find((b) => b.name === recipient.provider)?.logo : undefined;
  return (
    <View>
      <IconCircle>
        <AppText variant="captionL" weight="semiBold" style={styles.black}>
          {initials(recipient.name)}
        </AppText>
      </IconCircle>
      {logo ? <Image source={logo} style={styles.badge} /> : null}
    </View>
  );
}

type Lookup = { state: "idle" } | { state: "checking" } | { state: "found"; name: string };

/**
 * Account-number wizard: suggested banks fade in under the field, then once a bank is chosen and
 * the number is long enough, the holder's name is looked up (pulsing placeholder → result).
 */
function AccountTransfer({ number, onPick }: { number: string; onPick: (r: Recipient) => void }) {
  const { theme } = useUnistyles();
  const [bank, setBank] = useState<Provider>();
  const ready = !!bank && number.length >= MIN_ACCOUNT;
  const key = ready ? `${bank.id}:${number}` : "";
  const [checking, setChecking] = useState("");
  const [found, setFound] = useState<{ key: string; name: string }>();

  useEffect(() => {
    if (!key) return;
    const start = setTimeout(() => setChecking(key), 200);
    const done = setTimeout(() => {
      setFound({ key, name: lookupAccount(key) });
      Haptics.selectionAsync().catch(() => {});
    }, 1000);
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

  return (
    <Animated.View entering={fade()} layout={layout} style={styles.sections}>
      <View style={styles.section}>
        <AppText variant="bodyL" weight="semiBold">
          Choose bank
        </AppText>
        <View style={styles.banks}>
          {banks.map((b, i) => (
            <Animated.View key={b.id} entering={rise(i * 30)}>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setBank(b);
                }}
                style={[styles.bank, bank?.id === b.id && styles.bankOn]}
              >
                <Image source={b.logo} style={styles.bankLogo} />
                <AppText variant="body" weight={bank?.id === b.id ? "semiBold" : "regular"}>
                  {b.name}
                </AppText>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View layout={layout}>
        {lookup.state === "found" ? (
          <Animated.View key="found" entering={rise()}>
            <Tappable
              style={styles.result}
              onPress={() => onPick({ name: lookup.name, channel: "Bank", provider: bank!.name, account: number })}
            >
              <IconCircle>
                <AppText variant="captionL" weight="semiBold" style={styles.black}>
                  {initials(lookup.name)}
                </AppText>
              </IconCircle>
              <View style={styles.rowText}>
                <AppText variant="body" weight="semiBold">
                  {lookup.name}
                </AppText>
                <AppText variant="captionL" tone="secondary">
                  {bank!.name} · {number}
                </AppText>
              </View>
              <View style={styles.check}>
                <AppIcon name="check" size={14} color={theme.colors.surfaceRaised} />
              </View>
            </Tappable>
          </Animated.View>
        ) : lookup.state === "checking" ? (
          <Skeleton key="checking" />
        ) : (
          <Animated.View key="hint" entering={fade()}>
            <AppText variant="captionL" tone="secondary">
              {!bank
                ? "Choose the bank this account is with"
                : `Enter ${MIN_ACCOUNT - number.length} more digit${MIN_ACCOUNT - number.length === 1 ? "" : "s"} to check the name`}
            </AppText>
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

/** Pulsing placeholder in the shape of the result row while the name is being checked. */
function Skeleton() {
  const o = useSharedValue(0.6);
  useEffect(() => {
    o.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [o]);
  const pulse = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View entering={fade()} style={[styles.result, pulse]}>
      <View style={styles.skCircle} />
      <View style={styles.rowText}>
        <View style={[styles.skBar, { width: 140 }]} />
        <View style={[styles.skBar, { width: 200, height: 10 }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  fill: { flex: 1 },
  screen: { paddingBottom: 0 },
  content: { paddingTop: 24, paddingBottom: rt.insets.bottom + 24 },
  sections: { gap: 24 },
  section: { gap: 16 },
  recent: { gap: 20, paddingRight: 16 },
  recentItem: { alignItems: "center", gap: 8, width: 56 },
  list: { padding: 18, borderRadius: 18, backgroundColor: theme.colors.surfaceRaised },
  divider: { height: 1, marginVertical: 12, backgroundColor: theme.colors.stroke.soft },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  rowText: { flex: 1, gap: 6 },
  black: { color: theme.palette.black },
  badge: { position: "absolute", right: -2, bottom: -2, width: 20, height: 20 },
  empty: { paddingVertical: 12 },
  banks: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bank: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingLeft: 6,
    paddingRight: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: theme.colors.stroke.soft,
    backgroundColor: theme.colors.surfaceRaised,
  },
  bankOn: { borderColor: theme.colors.brandDark },
  bankLogo: { width: 32, height: 32 },
  result: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceRaised,
  },
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
