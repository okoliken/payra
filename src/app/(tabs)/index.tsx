import { useRef, useState } from "react";
import { useGuardedRouter } from '@/lib/navigation';
import {
  FlatList,
  Pressable,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Link } from 'expo-router';
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Droplets,
  Eye,
  EyeOff,
  LayoutGrid,
  Plus,
  Wifi,
  Zap,
} from "lucide-react-native";
import { AppText, Card, IconButton, Logo, Screen } from "@/components/ui";
import { AppIcon } from "@/components/app-icon";
import { TransactionRow } from "@/components/transaction-row";
import { homeBanners, otherPayments } from "@/data/mock";
import { formatMoney } from "@/lib/format";
import { selectUnreadCount, useStore } from '@/store/app-store';

const paymentIcons = {
  electricity: Zap,
  water: Droplets,
  internet: Wifi,
  more: LayoutGrid,
} as const;

export default function HomeScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { user, balance, hideBalance, toggleBalance, transactions } = useStore();
  const unreadCount = useStore(selectUnreadCount);
  const { width } = useWindowDimensions();
  const bannerWidth = width - theme.spacing.gutter * 2;
  const [banner, setBanner] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onBannerEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setBanner(
      Math.round(
        e.nativeEvent.contentOffset.x / (bannerWidth + theme.spacing.md),
      ),
    );

  return (
    <Screen scroll tabBarInset>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Logo size={32} />
        <View style={styles.topActions}>
          <IconButton onPress={() => router.push("/notifications")}>
            <AppIcon name="bell" size={20} color={theme.colors.brandDark} />
            {unreadCount > 0 ? <View style={styles.badge} /> : null}
          </IconButton>
          <Pressable
            onPress={() => router.push("/promo")}
            style={styles.promoChip}
          >
            <AppIcon name="sale" size={20} color={theme.colors.brandDark} />
            <AppText variant="body" weight="semiBold" tone="onBrand">
              Promo
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* Balance card */}
      <Card tone="dark" style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <View>
            <AppText variant="bodyL" weight="semiBold" tone="onDark">
              Hello, {user.name.split(" ")[0]}
            </AppText>
            <AppText variant="captionL" tone="onDarkMuted">
              Your Balance
            </AppText>
          </View>
          <Pressable
            onPress={() => router.push("/points")}
            style={styles.pointsChip}
          >
            <AppIcon name="coin" size={12} color={theme.colors.brandDark} />
            <AppText variant="captionL" weight="semiBold" tone="onBrand">
              {user.points} Points
            </AppText>
          </Pressable>
        </View>
        <View style={styles.balanceRow}>
          <AppText variant="h2" weight="semiBold" tone="onDark">
            {hideBalance ? "$ ••••••" : formatMoney(balance)}
          </AppText>
          <IconButton
            tone="onDark"
            size="md"
            onPress={() => toggleBalance()}
          >
            {hideBalance ? (
              <EyeOff size={16} color={theme.colors.onBrandDark} />
            ) : (
              <Eye size={16} color={theme.colors.onBrandDark} />
            )}
          </IconButton>
        </View>
        <View style={styles.actions}>
          <IconButton tone="brand" onPress={() => router.push("/top-up")}>
            <Plus size={18} color={theme.colors.onBrand} />
          </IconButton>
          <Pressable
            onPress={() => router.push("/request")}
            style={styles.actionPill}
          >
            <ArrowDownLeft size={14} color={theme.colors.onBrandDark} />
            <AppText variant="captionL" weight="semiBold" tone="onDark">
              Request
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => router.push("/transfer")}
            style={styles.actionPill}
          >
            <ArrowUpRight size={14} color={theme.colors.onBrandDark} />
            <AppText variant="captionL" weight="semiBold" tone="onDark">
              Transfer
            </AppText>
          </Pressable>
          <IconButton tone="onDark" onPress={() => router.push("/scan")}>
            <AppIcon name="scanner" size={16} color={theme.colors.onBrandDark} />
          </IconButton>
        </View>
      </Card>

      {/* Other payment */}
      <AppText variant="body" weight="semiBold" style={styles.sectionTitle}>
        Other Payment
      </AppText>
      <Card style={styles.paymentsCard}>
        {otherPayments.map((p) => {
          const Icon = paymentIcons[p.key];
          return (
            <Pressable
              key={p.key}
              onPress={() =>
                router.push(
                  p.key === "more" ? "/bills/more" : `/bills/${p.key}`,
                )
              }
              style={styles.paymentItem}
            >
              <View style={styles.paymentIcon}>
                <Icon size={20} color={theme.colors.text} strokeWidth={1.75} />
              </View>
              <AppText variant="captionL" tone="secondary">
                {p.label}
              </AppText>
            </Pressable>
          );
        })}
      </Card>

      {/* Promo banners */}
      <FlatList
        ref={listRef}
        data={homeBanners}
        keyExtractor={(b) => b.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={bannerWidth + theme.spacing.md}
        decelerationRate="fast"
        onMomentumScrollEnd={onBannerEnd}
        contentContainerStyle={{ gap: theme.spacing.md }}
        style={styles.banners}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push("/promo")}>
            <Card tone="brand" style={[styles.banner, { width: bannerWidth }]}>
              <View style={styles.bannerCopy}>
                <AppText variant="h5" weight="bold" tone="onBrand">
                  {item.title}
                </AppText>
                <AppText variant="body" weight="medium" tone="onBrand">
                  {item.subtitle}
                </AppText>
                <AppText
                  variant="captionS"
                  tone="onBrand"
                  style={styles.bannerBody}
                >
                  {item.body}
                </AppText>
              </View>
              <View style={styles.bannerArt}>
                <Logo size={44} wordmark={false} />
              </View>
            </Card>
          </Pressable>
        )}
      />
      <View style={styles.dots}>
        {homeBanners.map((b, i) => (
          <View
            key={b.id}
            style={[styles.dot, i === banner && styles.dotActive]}
          />
        ))}
      </View>

      {/* Recent transactions */}
      <View style={styles.recentHeader}>
        <AppText variant="body" weight="semiBold">
          Recent Transaction
        </AppText>
        <Link href="/history">
          <AppText variant="captionL" weight="semiBold" tone="secondary">
            See all
          </AppText>
        </Link>
      </View>
      <View style={styles.recentList}>
        {transactions.slice(0, 3).map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    marginBottom: theme.spacing.md,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  badge: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
  },
  promoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brand,
  },
  balanceCard: { borderRadius: theme.radius.xl, gap: theme.spacing.md },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  // Figma: 88 hug × 32, gap 4, padding 6 top/bottom, 8 left, 10 right, r24, Brand/Primary.
  pointsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 32,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 8,
    paddingRight: 10,
    borderRadius: 24,
    backgroundColor: theme.colors.brand,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  actionPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  sectionTitle: {
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
  },
  paymentsCard: { flexDirection: "row", justifyContent: "space-between" },
  paymentItem: { alignItems: "center", gap: theme.spacing.sm, width: 64 },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  banners: {
    marginTop: theme.spacing.lg,
    marginHorizontal: -theme.spacing.gutter,
    paddingHorizontal: theme.spacing.gutter,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    minHeight: 100,
  },
  bannerCopy: { flex: 1, gap: 2 },
  bannerBody: { marginTop: 4, maxWidth: 160 },
  bannerArt: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(11,70,71,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: -30,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: theme.spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.fill.strong,
  },
  dotActive: { width: 16, backgroundColor: theme.colors.brandDark },
  recentList: { gap: theme.spacing.lg },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
  },
}));
