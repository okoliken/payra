import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";
import { AppText } from "@/components/ui";
import { EASE, fade, rise } from "@/lib/motion";

/**
 * Payra's own state graphics, built from the logo instead of stock icons: the logo's plate (a
 * square with clipped corners, 40×30) and its square "." accent.
 */
const PLATE = "M0 22.75V0L29.8701 0L40 9.5V30H7.53247L0 22.75Z";
const DOT = { x: 25.71, y: 18.75, w: 4.16, h: 4 };
const CHECK = "M10.5 14.6 L16.2 20.2 L27.5 8.9";
const CHECK_LENGTH = 24;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * Success: the teal plate, a yellow check that draws itself inside it, then the "." lands.
 * `width` is the plate's width; height follows the logo's 4:3.
 */
export function SuccessMark({ width = 120, delay = 0 }: { width?: number; delay?: number }) {
  const { theme } = useUnistyles();
  const draw = useSharedValue(0);
  const dot = useSharedValue(0);
  useEffect(() => {
    draw.value = withDelay(delay + 160, withTiming(1, { duration: 420, easing: EASE }));
    dot.value = withDelay(delay + 520, withTiming(1, { duration: 200 }));
  }, [delay, draw, dot]);
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LENGTH * (1 - draw.value) }));
  const dotProps = useAnimatedProps(() => ({ opacity: dot.value }));

  return (
    <Animated.View entering={rise(delay)}>
      <Svg width={width} height={(width * 3) / 4} viewBox="0 0 40 30">
        <Path d={PLATE} fill={theme.colors.brandDark} />
        <AnimatedPath
          d={CHECK}
          stroke={theme.colors.brand}
          strokeWidth={3.4}
          strokeLinecap="square"
          fill="none"
          strokeDasharray={CHECK_LENGTH}
          animatedProps={checkProps}
        />
        <AnimatedRect x={DOT.x} y={DOT.y} width={DOT.w} height={DOT.h} fill={theme.colors.brand} animatedProps={dotProps} />
      </Svg>
    </Animated.View>
  );
}

/** Empty: the plate as a soft dashed outline with only its "." inside. */
export function EmptyState({ title, body }: { title: string; body?: string }) {
  const { theme } = useUnistyles();
  return (
    <Animated.View entering={fade()} style={{ alignItems: "center", gap: 16, paddingVertical: 24 }}>
      <Svg width={88} height={66} viewBox="-1 -1 42 32">
        <Path
          d={PLATE}
          fill={theme.colors.surfaceMuted}
          stroke={theme.colors.textQuaternary}
          strokeWidth={0.8}
          strokeDasharray="2.4 1.8"
        />
        <Rect x={DOT.x} y={DOT.y} width={DOT.w} height={DOT.h} fill={theme.colors.brandDark} />
      </Svg>
      <View style={{ gap: 4 }}>
        <AppText variant="body" weight="semiBold" align="center">
          {title}
        </AppText>
        {body ? (
          <AppText variant="captionL" tone="secondary" align="center">
            {body}
          </AppText>
        ) : null}
      </View>
    </Animated.View>
  );
}
