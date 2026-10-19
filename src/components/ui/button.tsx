import { useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText } from "./text";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "soft";
type Size = "lg" | "md" | "sm";

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Rendered after the label, e.g. a lucide icon. */
  icon?: React.ReactNode;
  iconLeft?: React.ReactNode;
  fullWidth?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = "primary",
  size = "lg",
  loading = false,
  icon,
  iconLeft,
  fullWidth = true,
  haptic = true,
  disabled,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const { theme } = useUnistyles();
  const lastPress = useRef(0);
  styles.useVariants({
    variant,
    size,
    fullWidth,
    disabled: !!disabled || loading,
  });

  const labelTone =
    variant === "primary"
      ? "onBrand"
      : variant === "secondary"
        ? "onDark"
        : "primary";
  const spinnerColor =
    variant === "primary"
      ? theme.colors.onBrand
      : variant === "secondary"
        ? theme.colors.onBrandDark
        : theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={(e) => {
        // Double taps fire onPress twice; only the first one within 500ms counts.
        const now = Date.now();
        if (now - lastPress.current < 500) return;
        lastPress.current = now;
        if (haptic)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {},
          );
        onPress?.(e);
      }}
      style={({ pressed }) => [styles.base, style, pressed && styles.pressed]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <View style={styles.row}>
          {iconLeft}
          <AppText
            variant={size === "sm" ? "captionL" : "body"}
            weight="semiBold"
            tone={labelTone}
          >
            {title}
          </AppText>
          {icon}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    variants: {
      variant: {
        primary: { backgroundColor: theme.colors.brand },
        secondary: { backgroundColor: theme.colors.brandDark },
        outline: {
          backgroundColor: theme.colors.surfaceRaised,
          borderWidth: 1,
          borderColor: theme.colors.stroke.soft,
        },
        ghost: { backgroundColor: "transparent" },
        soft: { backgroundColor: theme.colors.surfaceAlt },
      },
      size: {
        lg: { height: 48 },
        md: { height: 40 },
        sm: { height: 32, paddingHorizontal: theme.spacing.md },
      },
      fullWidth: {
        true: { alignSelf: "stretch" },
        false: { alignSelf: "flex-start" },
      },
      disabled: {
        true: { opacity: 0.5 },
      },
    },
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  row: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
}));
