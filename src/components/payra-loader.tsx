import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { AppText } from "@/components/ui";
import { fade } from "@/lib/motion";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const BAR = 72;
const THUMB = 24;

/**
 * Branded loading state: the Payra mark with its "." gently pulsing and a thin progress line
 * sliding under it. Used while the app "fetches your account" after the PIN and while a payment
 * goes through.
 */
export function PayraLoader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const pulse = useSharedValue(1);
  const slide = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.25, { duration: 600, easing: Easing.inOut(Easing.quad) }), -1, true);
    slide.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.cubic) }), -1, true);
  }, [pulse, slide]);

  const dot = useAnimatedProps(() => ({ fillOpacity: pulse.value }));
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: slide.value * (BAR - THUMB) }] }));

  return (
    <Animated.View entering={fade()} style={styles.center}>
      <Svg width={64} height={48} viewBox="0 0 40 30" fill="none">
        <Path d="M0 22.75V0L29.8701 5.87608e-05L40 9.50004V30H7.53247L0 22.75Z" fill="#0B4647" />
        <Path
          d="M13.5065 6.58843C14.8153 5.01091 16.8304 4.00005 19.0909 4.00005C23.0358 4.00005 26.2338 7.07809 26.2338 10.875C26.2338 14.672 23.0358 17.75 19.0909 17.75C16.8303 17.75 14.8153 16.739 13.5065 15.1614V22.75H7.53247V4.00005H13.5065V6.58843Z"
          fill="#ECF0AF"
        />
        <AnimatedPath d="M25.7143 18.75H29.8701V22.75H25.7143V18.75Z" fill="#ECF0AF" animatedProps={dot} />
      </Svg>
      <View style={styles.track}>
        <Animated.View style={[styles.thumb, thumb]} />
      </View>
      {title ? (
        <View style={styles.copy}>
          <AppText variant="h5" weight="semiBold" align="center">
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="body" tone="secondary" align="center">
              {subtitle}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  track: { width: BAR, height: 3, borderRadius: 2, overflow: "hidden", backgroundColor: theme.colors.fill.medium },
  thumb: { width: THUMB, height: 3, borderRadius: 2, backgroundColor: theme.colors.brandDark },
  copy: { gap: 6, marginTop: 4 },
}));
