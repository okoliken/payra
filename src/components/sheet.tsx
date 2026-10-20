import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native-unistyles";
import { PrivacyShield } from "@/components/privacy-shield";

const OPEN = { duration: 340, easing: Easing.bezier(0.32, 0.72, 0, 1) };
const CLOSE = { duration: 240, easing: Easing.in(Easing.cubic) };
const OFFSCREEN = 900;

/**
 * Bottom sheet: slides up over a blurred, lightly dimmed backdrop with an iOS-like ease, drags down to dismiss,
 * and eases its height when the content changes (a wizard moving from Review to PIN).
 * Tapping the backdrop or dragging past 100pt closes it; `onClose` runs once it is off screen.
 */
export function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(visible);
  const y = useSharedValue(OFFSCREEN);
  const drag = useSharedValue(0);

  // Mount as soon as it should show; unmount only after the slide-out finishes.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      drag.value = 0;
      y.value = withTiming(0, OPEN);
    } else if (mounted) {
      y.value = withTiming(OFFSCREEN, CLOSE, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
  }, [visible, mounted, y, drag]);

  const close = () => onClose();

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      drag.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      if (drag.value > 100 || e.velocityY > 900) {
        runOnJS(close)();
      } else {
        drag.set(withTiming(0, OPEN));
      }
    });

  const panel = useAnimatedStyle(() => ({ transform: [{ translateY: y.value + drag.value }] }));
  // The blur fades with the sheet: fully in when open, thinning out as it is dragged down.
  const backdrop = useAnimatedStyle(() => ({ opacity: 1 - Math.min(1, (y.value + drag.value) / 400) }));

  return (
    <Modal transparent visible={mounted} animationType="none" statusBarTranslucent onRequestClose={close}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[styles.backdrop, backdrop]}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable style={[styles.fill, styles.dim]} onPress={close} />
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.panel, panel]} layout={LinearTransition.duration(260).easing(Easing.out(Easing.cubic))}>
            <View style={styles.grabber} />
            {children}
          </Animated.View>
        </GestureDetector>
        {/* The Modal is its own window above the app, so it needs its own privacy cover. */}
        <PrivacyShield />
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: { flex: 1, justifyContent: "flex-end" },
  fill: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  dim: { backgroundColor: "rgba(0, 0, 0, 0.1)" },
  panel: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: rt.insets.bottom + 12,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: theme.colors.background,
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 3,
    marginBottom: 16,
    backgroundColor: theme.colors.textQuaternary,
  },
}));
