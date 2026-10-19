import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

/**
 * Cross-fade for tab scenes, driven by tab selection instead of the navigator's Animated transition.
 * The built-in `animation: 'fade'` interpolates each scene's opacity from a JS Animated value
 * that is only updated inside a `useEffect`; when that effect and a scene detach raced, the
 * focused scene was left at opacity 0 until the next navigation. Here selection is the source of
 * truth: whenever a tab is selected its opacity animates to 1, so it can't stick at 0.
 * Selected, not focused: a screen pushed over the tabs (Transfer) takes focus too, and fading on
 * focus blanked Home underneath it, which showed as an empty screen during the swipe back.
 */
export function TabScene({ selected, children }: { selected: boolean; children: React.ReactNode }) {
  const style = useAnimatedStyle(() => ({
    opacity: selected ? withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }) : 0,
  }));
  return <Animated.View style={[styles.scene, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create((theme) => ({
  scene: { flex: 1, backgroundColor: theme.colors.background },
}));
