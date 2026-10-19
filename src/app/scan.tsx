import { useEffect, useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppText, Header, IconButton } from "@/components/ui";
import { AppIcon, type IconName } from "@/components/app-icon";
import { useGuardedRouter } from "@/lib/navigation";

/**
 * Figma "Scan QRIS" (402×874), three frames: Idle → Scanning → Completed.
 * - Overlay: full-frame Text/Primary at 70% over Background/B0 (the design has no camera feed).
 * - Nav Bar: 48pt Secondary icon buttons (back, flash) on a 64pt row.
 * - Scanner Line: 402×110, vertical linear fill ECF0AF 50% → 0% at the midpoint, 6pt inside
 *   stroke on top. Sits at y≈152 while scanning and y≈463 when completed.
 * - QRIS container: x16 w370, gap 18, centred — "QRIS · Supported" row (gap 14, Body SemiBold
 *   B1) then two Secondary/Small pills (h36, r24, pad 12, gap 8, Caption SemiBold Text/Primary).
 * - Bottom Sheets at y696 (h178): B0, top radius 24, 72×4 handle at y8, content at y36
 *   (x16): Body Large SemiBold #000000 title, gap 24, two Primary/Small pills.
 * TODO(figma-assets): QRIS logo, flash, gallery-add-bold, verified, qr-code, nfc icons.
 */
const FRAME_H = 874;
const SCAN_START = 152;
const SCAN_END = 463;
const LINE_H = 110;
const SHEET_H = 178;
const SHEET_HOME_BAR = 34;
// 178 − handle area 36 − title 24 − gap 24 − pills 36 − home bar 34.
const SHEET_PAD_BOTTOM = SHEET_H - 36 - 24 - 24 - 36 - SHEET_HOME_BAR;

export default function ScanScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [flash, setFlash] = useState(false);
  const sy = height / FRAME_H;

  // Scanner line: hidden (Idle) → travels down (Scanning) → rests at the bottom (Completed).
  const lineY = useSharedValue(SCAN_START * sy);
  const lineOpacity = useSharedValue(0);
  useEffect(() => {
    const done = () =>
      router.replace({
        pathname: "/success",
        params: {
          title: "Payment Successful",
          body: "Your QRIS payment has been processed securely.",
          next: "/(tabs)",
        },
      });
    lineOpacity.value = withDelay(500, withTiming(1, { duration: 200 }));
    lineY.value = withDelay(
      700,
      withSequence(
        withTiming(SCAN_END * sy, { duration: 1600, easing: Easing.inOut(Easing.cubic) }),
        withTiming(SCAN_END * sy, { duration: 500 }, (finished) => {
          if (finished) runOnJS(done)();
        }),
      ),
    );
  }, [lineOpacity, lineY, router, sy]);

  const lineStyle = useAnimatedStyle(() => ({
    opacity: lineOpacity.value,
    transform: [{ translateY: lineY.value }],
  }));

  return (
    <View style={styles.root}>
      <View style={styles.overlay} pointerEvents="none" />

      <Animated.View style={[styles.line, lineStyle]} pointerEvents="none">
        <Svg width="100%" height={LINE_H}>
          <Defs>
            <LinearGradient id="scan-fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.colors.brand} stopOpacity={0.5} />
              <Stop offset="0.5" stopColor={theme.colors.brand} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height={LINE_H} fill="url(#scan-fill)" />
          <Rect x="0" y="0" width="100%" height={6} fill={theme.colors.brand} />
        </Svg>
      </Animated.View>

      <View style={[styles.nav, { paddingTop: insets.top }]}>
        <Header
          right={
            <IconButton size="lg" onPress={() => setFlash((f) => !f)} accessibilityState={{ selected: flash }}>
              <AppIcon name="flash" size={20} color={theme.colors.brandDark} />
            </IconButton>
          }
        />
      </View>

      <View style={styles.bottom}>
        <View style={styles.qris}>
          <View style={styles.supported}>
            {/* TODO(figma-assets): QRIS logo image. */}
            <AppText variant="body" weight="bold" tone="onDark">
              QRIS
            </AppText>
            <AppText variant="body" weight="semiBold" tone="onDark">
              Supported
            </AppText>
          </View>
          <View style={styles.pillRow}>
            <Pill label="Upload QR" icon="gallery-add-bold" onPress={() => {}} />
            <Pill label="QRIS Cashback" icon="verified" onPress={() => router.push("/promo")} />
          </View>
        </View>

        <View style={[styles.sheet, { paddingBottom: SHEET_PAD_BOTTOM + insets.bottom }]}>
          <View style={styles.handle} />
          <AppText variant="bodyL" weight="semiBold" style={styles.sheetTitle}>
            You can also pay with
          </AppText>
          <View style={styles.pillRow}>
            <Pill primary label="Show QRIS Code" icon="qr-code" onPress={() => router.push("/request")} />
            <Pill primary label="QRIS Tap" icon="nfc" onPress={() => {}} />
          </View>
        </View>
      </View>
    </View>
  );
}

/** Figma "Buttons" Small (Primary / Secondary, Light, Icon Right): h36, r24, pad 12, gap 8. */
function Pill({
  label,
  icon,
  primary = false,
  onPress,
}: {
  label: string;
  icon: IconName;
  primary?: boolean;
  onPress: () => void;
}) {
  const { theme } = useUnistyles();
  styles.useVariants({ primary });
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
    >
      <AppText variant="captionL" weight="semiBold" tone={primary ? "onBrand" : "primary"}>
        {label}
      </AppText>
      <AppIcon name={icon} size={16} color={theme.colors.brandDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.text,
    opacity: 0.7,
  },
  line: { position: "absolute", left: 0, right: 0, top: 0, height: LINE_H },
  nav: { paddingHorizontal: theme.spacing.lg },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  qris: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    alignItems: "center",
    gap: 18,
  },
  supported: { flexDirection: "row", alignItems: "center", gap: 14 },
  pillRow: { flexDirection: "row", alignSelf: "stretch", gap: theme.spacing.md },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 36,
    paddingHorizontal: theme.spacing.lg,
  },
  handle: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    width: 72,
    height: 4,
    borderRadius: 100,
    backgroundColor: theme.colors.textQuaternary,
  },
  sheetTitle: { color: "#000000", marginBottom: theme.spacing.xxl },
  pill: {
    flex: 1,
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 24,
    variants: {
      primary: {
        true: { backgroundColor: theme.colors.brand },
        false: {
          backgroundColor: theme.colors.surfaceRaised,
          borderWidth: 1,
          borderColor: theme.colors.stroke.soft,
        },
      },
    },
  },
  pillPressed: { opacity: 0.85 },
}));
