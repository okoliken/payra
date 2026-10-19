import { useEffect } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * Figma "Bottom Sheets" component: dimmed overlay, sheet with 24pt top radius and a drag handle,
 * content padded 24. Slides up / fades in with Reanimated.
 */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, progress]);

  const backdrop = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheet = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 400 }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdrop]}>
          <Pressable
            style={styles.fill}
            onPress={onClose}
            accessibilityLabel="Close"
          />
        </Animated.View>
        <Animated.View style={[styles.sheet, sheet]}>
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(24, 24, 27, 0.5)",
  },
  fill: { flex: 1 },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.sm,
    paddingBottom: rt.insets.bottom + theme.spacing.xxl,
  },
  handle: {
    alignSelf: "center",
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textQuaternary,
    marginBottom: theme.spacing.xxl,
  },
}));
