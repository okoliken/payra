import { useEffect, useState } from "react";
import { Pressable, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText } from "./text";

export type SegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

const PADDING = 6;
const GAP = 6;
const TIMING = { duration: 260, easing: Easing.bezier(0.2, 0.8, 0.2, 1) };

/**
 * Figma "Segmented Controls": 60 tall, padding 6, gap 6, r28, Brand/Secondary track;
 * the active "Segmented" pill (48 tall, r24, Brand/Primary) slides between segments and each
 * label cross-fades between white and Brand/Secondary as the pill reaches it.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  const count = options.length;
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const [trackWidth, setTrackWidth] = useState(0);
  const segmentWidth =
    trackWidth > 0 ? (trackWidth - PADDING * 2 - GAP * (count - 1)) / count : 0;

  // Position of the pill expressed as a segment index; animated between integers.
  const position = useSharedValue(activeIndex);
  useEffect(() => {
    position.value = withTiming(activeIndex, TIMING);
  }, [activeIndex, position]);

  const pill = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: position.value * (segmentWidth + GAP) }],
  }));

  const onLayout = (e: LayoutChangeEvent) =>
    setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.track} onLayout={onLayout}>
      {/* Inactive segment backgrounds (10% white, r24) sit under the sliding pill. */}
      {options.map((opt) => (
        <View key={`bg-${opt.value}`} style={styles.inactive} />
      ))}
      {segmentWidth > 0 ? <Animated.View style={[styles.pill, pill]} /> : null}
      <View style={styles.labels}>
      {options.map((opt, i) => (
        <SegmentLabel
          key={opt.value}
          label={opt.label}
          index={i}
          position={position}
          selected={i === activeIndex}
          onPress={() => {
            if (opt.value === value) return;
            Haptics.selectionAsync().catch(() => {});
            onChange(opt.value);
          }}
        />
      ))}
      </View>
    </View>
  );
}

function SegmentLabel({
  label,
  index,
  position,
  selected,
  onPress,
}: {
  label: string;
  index: number;
  position: SharedValue<number>;
  selected: boolean;
  onPress: () => void;
}) {
  // 1 when the pill is centred on this segment, 0 once it has moved a full segment away.
  const onBrand = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(position.value - index),
      [0, 1],
      [1, 0],
      "clamp",
    ),
  }));
  const onDark = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(position.value - index),
      [0, 1],
      [0, 1],
      "clamp",
    ),
  }));
  return (
    <Pressable
      onPress={onPress}
      style={styles.segment}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
    >
      <Animated.View style={[styles.labelLayer, onDark]}>
        <AppText variant="body" weight="semiBold" tone="onDark" align="center">
          {label}
        </AppText>
      </Animated.View>
      <Animated.View style={[styles.labelLayer, onBrand]}>
        <AppText variant="body" weight="semiBold" tone="onBrand" align="center">
          {label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    flexDirection: "row",
    height: 60,
    padding: PADDING,
    gap: GAP,
    borderRadius: 28,
    backgroundColor: theme.colors.brandDark,
  },
  pill: {
    position: "absolute",
    top: PADDING,
    left: PADDING,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.brand,
  },
  // Inactive segment fill (restored): 10% white, same as the nav bar's inactive circles.
  inactive: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(250, 250, 250, 0.10)",
  },
  // Label row floats above the backgrounds and the pill so text stays on top.
  labels: {
    position: "absolute",
    top: PADDING,
    left: PADDING,
    right: PADDING,
    flexDirection: "row",
    gap: GAP,
  },
  segment: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  labelLayer: { position: "absolute", left: 0, right: 0, alignItems: "center" },
}));
