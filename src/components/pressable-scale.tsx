import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
  /** How far it shrinks under the finger (default 0.96). */
  scale?: number;
  haptic?: boolean;
};

/** Anything tappable that should answer the finger: shrinks on press, springs back, light haptic. */
export function PressableScale({ style, scale = 0.96, haptic = true, onPressIn, onPressOut, ...rest }: Props) {
  const down = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: 1 - (1 - scale) * down.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      style={[style, animated]}
      onPressIn={(e) => {
        down.set(withTiming(1, { duration: 90 }));
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        down.set(withSpring(0, { damping: 14, stiffness: 260 }));
        onPressOut?.(e);
      }}
    />
  );
}
