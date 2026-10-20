import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
};

/** Tappable surface that answers the finger quietly: dims slightly while pressed, light haptic. */
export function Tappable({ style, haptic = true, onPressIn, onPressOut, ...rest }: Props) {
  const down = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({ opacity: 1 - 0.35 * down.value }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      style={[style, animated]}
      onPressIn={(e) => {
        down.set(withTiming(1, { duration: 80 }));
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        down.set(withTiming(0, { duration: 200 }));
        onPressOut?.(e);
      }}
    />
  );
}
