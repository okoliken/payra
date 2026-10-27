import { useEffect, useState } from "react";
import { Image, Pressable, TextInput, View, useWindowDimensions } from "react-native";
import { useIsFocused } from "expo-router";
import Animated, {
  Easing,
  LinearTransition,
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText, IconCircle, Logo, Screen } from "@/components/ui";
import { AppIcon, type IconName } from "@/components/app-icon";
import { TransactionRow } from "@/components/transaction-row";
import { Tappable } from "@okoli/ui";
import { useGuardedRouter } from "@/lib/navigation";
import { formatMoney, formatMoneyWorklet } from "@/lib/format";
import { useStore } from "@/store/app-store";
import { rise } from "@/lib/motion";

const payments: { label: string; icon: IconName }[] = [
  { label: "Electricity", icon: "bolt" },
  { label: "Water", icon: "waterdrop" },
  { label: "Internet", icon: "wifi" },
  { label: "More", icon: "widget" },
];

// Promo banners exported from the Figma carousel, yellow one first as in the frame.
const banners = [
  require("@/../assets/images/promo-2.png"),
  require("@/../assets/images/promo-3.png"),
  require("@/../assets/images/promo-1.png"),
];
const BANNER_GAP = 6;

const AnimatedInput = Animated.createAnimatedComponent(TextInput);
Animated.addWhitelistedNativeProps({ text: true });

export default function HomeScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { user, balance, hideBalance, toggleBalance, transactions } = useStore();
  const focused = useIsFocused();
  const { width } = useWindowDimensions();
  const bannerWidth = width - theme.spacing.gutter * 2;
  const bannerStep = bannerWidth + BANNER_GAP;
  const scrollX = useSharedValue(0);

  // Changes made on other screens (a transfer) play out here once Home is back on screen:
  // the balance counts to its new value and the new transaction slides in at the top.
  const shownBalance = useSharedValue(balance);
  const [shownTransactions, setShownTransactions] = useState(transactions);
  useEffect(() => {
    if (!focused) return;
    shownBalance.value = withDelay(350, withTiming(balance, { duration: 900, easing: Easing.out(Easing.cubic) }));
    const t = setTimeout(() => setShownTransactions(transactions), 350);
    return () => clearTimeout(t);
  }, [focused, balance, transactions, shownBalance]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const tap = () => Haptics.selectionAsync().catch(() => {});

  return (
    <Screen scroll tabBarInset gutter={false}>
      <View style={styles.gutter}>
        <View style={styles.topBar}>
          <Logo size={40} />
          <View style={styles.topActions}>
            <Pressable style={styles.bell} onPress={tap} accessibilityRole="button" accessibilityLabel="Notifications">
              <AppIcon name="bell-bing" size={20} color={theme.colors.text} />
            </Pressable>
            <Pressable style={styles.promo} onPress={tap} accessibilityRole="button">
              <AppIcon name="sale-bold" size={20} color={theme.colors.brandDark} />
              <AppText variant="bodyL" weight="semiBold" tone="onBrand">
                Promo
              </AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <View style={styles.greeting}>
              <View style={styles.gap4}>
                <AppText variant="h5" weight="semiBold" style={styles.onCard}>
                  Hello, {user.name.split(" ")[0]}
                </AppText>
                <AppText variant="body" style={styles.onCard}>
                  Your Balance
                </AppText>
              </View>
              <View style={styles.points}>
                <AppIcon name="coin-vertical-fill" size={14} color={theme.colors.brandDark} />
                <AppText variant="captionS" weight="semiBold" tone="onBrand">
                  {user.points} Points
                </AppText>
              </View>
            </View>
            <View style={styles.balanceRow}>
              <Balance value={shownBalance} hidden={hideBalance} balance={balance} />
              <Pressable
                style={styles.eye}
                accessibilityRole="button"
                accessibilityLabel={hideBalance ? "Show balance" : "Hide balance"}
                hitSlop={8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  toggleBalance();
                }}
              >
                <EyeIcon hidden={hideBalance} />
              </Pressable>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable
              style={[styles.action, styles.actionIcon, styles.actionAdd]}
              accessibilityRole="button"
              accessibilityLabel="Top up"
              onPress={() => router.push({ pathname: "/send", params: { mode: "topup" } })}
            >
              <AppIcon name="add" size={16} color={theme.colors.brandDark} />
            </Pressable>
            <Pressable style={styles.action} onPress={tap} accessibilityRole="button">
              <AppIcon name="arrow-left-down" size={16} color={theme.colors.surfaceRaised} />
              <AppText variant="captionL" weight="semiBold" style={styles.onCard}>
                Request
              </AppText>
            </Pressable>
            <Pressable style={styles.action} onPress={() => router.push("/send")} accessibilityRole="button">
              <AppIcon name="arrow-right-up" size={16} color={theme.colors.surfaceRaised} />
              <AppText variant="captionL" weight="semiBold" style={styles.onCard}>
                Transfer
              </AppText>
            </Pressable>
            <Pressable style={[styles.action, styles.actionIcon]} onPress={tap} accessibilityRole="button" accessibilityLabel="Scan to pay">
              <AppIcon name="scanner" size={16} color={theme.colors.surfaceRaised} />
            </Pressable>
          </View>
        </View>

        <AppText variant="bodyL" weight="semiBold" style={styles.sectionTitle}>
          Other Payment
        </AppText>
        <View style={styles.payments}>
          {payments.map((p) => (
            <Pressable key={p.label} style={styles.payment} onPress={tap}>
              <IconCircle>
                <AppIcon name={p.icon} size={24} color={theme.colors.text} />
              </IconCircle>
              <AppText variant="captionL" style={styles.black}>
                {p.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <Animated.FlatList
        data={banners}
        keyExtractor={(_, i) => String(i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={bannerStep}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: bannerStep, offset: bannerStep * index, index })}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.bannerList}
        style={styles.banners}
        renderItem={({ item }) => (
          <Image source={item} style={{ width: bannerWidth, height: (bannerWidth * 316) / 1110, borderRadius: 16 }} />
        )}
      />
      <View style={styles.dots}>
        {banners.map((_, dot) => (
          <Dot key={dot} index={dot} step={bannerStep} scrollX={scrollX} />
        ))}
      </View>

      <View style={styles.gutter}>
        <View style={[styles.sectionTitle, styles.recentTitle, styles.sectionHead]}>
          <AppText variant="bodyL" weight="semiBold" style={styles.black}>
            Recent Transaction
          </AppText>
          <Tappable hitSlop={8} accessibilityLabel="View all transactions" onPress={() => router.push("/(tabs)/history")}>
            <AppText variant="captionL" weight="semiBold" tone="onBrand">
              View all
            </AppText>
          </Tappable>
        </View>
        <View style={styles.recent}>
          {shownTransactions.slice(0, 3).map((tx) => (
            <Animated.View
              key={tx.id}
              entering={rise()}
              layout={LinearTransition.duration(420).easing(Easing.out(Easing.cubic))}
            >
              <TransactionRow tx={tx} />
            </Animated.View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const MASK_DOTS = 6;

/**
 * Hiding the balance: the amount fades up a few points while six dots fade in one after another;
 * revealing plays it backwards. One shared value drives every piece on the UI thread.
 */
function Balance({ value, hidden, balance }: { value: SharedValue<number>; hidden: boolean; balance: number }) {
  const h = useSharedValue(hidden ? 1 : 0);
  useEffect(() => {
    h.value = withTiming(hidden ? 1 : 0, { duration: 420, easing: Easing.inOut(Easing.cubic) });
  }, [hidden, h]);

  const textProps = useAnimatedProps(() => {
    const text = formatMoneyWorklet(value.value);
    return { text, defaultValue: text } as object;
  });
  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(h.value, [0, 0.45], [1, 0], "clamp"),
    transform: [{ translateY: interpolate(h.value, [0, 0.45], [0, -4], "clamp") }],
  }));

  return (
    <View
      style={styles.balanceBox}
      accessible
      accessibilityRole="text"
      accessibilityLabel={hidden ? "Balance hidden" : `Balance ${formatMoney(balance)}`}
    >
      <AnimatedInput
        editable={false}
        pointerEvents="none"
        underlineColorAndroid="transparent"
        animatedProps={textProps}
        style={[styles.balance, textStyle]}
      />
      <View style={styles.mask} pointerEvents="none">
        <MaskGlyph h={h} index={0}>
          <AppText variant="h2" weight="bold" style={styles.onCardText}>
            $
          </AppText>
        </MaskGlyph>
        {Array.from({ length: MASK_DOTS }, (_, i) => (
          <MaskGlyph key={i} h={h} index={i + 1}>
            <View style={styles.maskDot} />
          </MaskGlyph>
        ))}
      </View>
    </View>
  );
}

function MaskGlyph({ h, index, children }: { h: SharedValue<number>; index: number; children: React.ReactNode }) {
  const style = useAnimatedStyle(() => {
    const start = 0.35 + index * 0.04;
    const p = interpolate(h.value, [start, start + 0.25], [0, 1], "clamp");
    return { opacity: p, transform: [{ translateY: (1 - p) * 4 }] };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** The Figma `eye` icon with a slash that draws across it while the balance is hidden. */
function EyeIcon({ hidden }: { hidden: boolean }) {
  const { theme } = useUnistyles();
  const p = useSharedValue(hidden ? 1 : 0);
  useEffect(() => {
    p.value = withTiming(hidden ? 1 : 0, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [hidden, p]);
  const slash = useAnimatedStyle(() => ({ transform: [{ rotate: "-45deg" }, { scaleX: p.value }] }));
  return (
    <View>
      <AppIcon name="eye" size={16} color={theme.colors.surfaceRaised} />
      <Animated.View style={[styles.slash, slash]} />
    </View>
  );
}

/** Figma "Page Controls: Dot": active 18×8 Brand/Secondary, inactive 8×8 Text/Quaternary; follows the swipe. */
function Dot({ index, step, scrollX }: { index: number; step: number; scrollX: SharedValue<number> }) {
  const { theme } = useUnistyles();
  const style = useAnimatedStyle(() => {
    const p = interpolate(scrollX.value, [(index - 1) * step, index * step, (index + 1) * step], [0, 1, 0], "clamp");
    return {
      width: 8 + 10 * p,
      backgroundColor: interpolateColor(p, [0, 1], [theme.colors.textQuaternary, theme.colors.brandDark]),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create((theme) => ({
  gutter: { paddingHorizontal: theme.spacing.gutter },
  // Figma: top bar 58 tall (8 padding), 24 above the balance card.
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 24,
  },
  topActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  bell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
  },
  promo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: theme.colors.brand,
  },
  // Figma balance card: 202 tall, padding 18, r24, Brand/Secondary, sections 24 apart.
  balanceCard: {
    padding: 18,
    gap: 24,
    borderRadius: 24,
    backgroundColor: theme.colors.brandDark,
  },
  balanceTop: { gap: 14 },
  greeting: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  gap4: { gap: 4 },
  onCard: { color: theme.colors.surfaceRaised },
  points: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 32,
    paddingLeft: 8,
    paddingRight: 10,
    borderRadius: 24,
    backgroundColor: theme.colors.brand,
  },
  balanceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  balanceBox: { flex: 1, justifyContent: "center" },
  mask: { position: "absolute", left: 0, flexDirection: "row", alignItems: "center", gap: 6 },
  maskDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.surfaceRaised },
  onCardText: { color: theme.colors.surfaceRaised },
  slash: {
    position: "absolute",
    left: -1,
    top: 7.25,
    width: 18,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: theme.colors.surfaceRaised,
  },
  balance: {
    padding: 0,
    color: theme.colors.surfaceRaised,
    ...theme.fonts.bold,
    ...theme.typography.h2,
  },
  eye: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(250, 250, 250, 0.1)",
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
  },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: "rgba(250, 250, 250, 0.1)",
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
  },
  actionIcon: { width: 40, paddingHorizontal: 0, justifyContent: "center" },
  actionAdd: { backgroundColor: theme.colors.brand, borderWidth: 0 },
  sectionTitle: { marginTop: 24, marginBottom: 16, color: theme.palette.black },
  // Figma: r24 card, padding 18; four 87.5pt columns centred on the icons.
  payments: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceRaised,
  },
  payment: { flex: 1, alignItems: "center", gap: 8 },
  banners: { marginTop: 24, flexGrow: 0 },
  bannerList: { paddingHorizontal: theme.spacing.gutter, gap: BANNER_GAP },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 9.5 },
  dot: { height: 8, borderRadius: 100 },
  recentTitle: { marginTop: 25.5 },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  black: { color: theme.palette.black },
  recent: { gap: 16 },
}));
