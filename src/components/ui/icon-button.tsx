import { Pressable, type PressableProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Tone = "surface" | "brand" | "dark" | "ghost" | "onDark";
type Size = "md" | "lg";

export type IconButtonProps = Omit<PressableProps, "style"> & {
  tone?: Tone;
  size?: Size;
  children: React.ReactNode;
};

/** Circular 40/48pt tap target used for back buttons, bell, quick actions. */
export function IconButton({
  tone = "surface",
  size = "md",
  children,
  ...rest
}: IconButtonProps) {
  styles.useVariants({ tone, size });
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={6}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    variants: {
      tone: {
        surface: {
          backgroundColor: theme.colors.surfaceRaised,
          borderWidth: 1,
          borderColor: theme.colors.stroke.soft,
        },
        brand: { backgroundColor: theme.colors.brand },
        dark: { backgroundColor: theme.colors.brandDark },
        ghost: { backgroundColor: "transparent" },
        onDark: { backgroundColor: "rgba(255,255,255,0.12)" },
      },
      size: {
        md: { width: 40, height: 40 },
        lg: { width: 48, height: 48 },
      },
    },
  },
  pressed: { opacity: 0.7 },
}));
