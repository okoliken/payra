import { View, type ViewProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Tone = "surface" | "dark" | "brand" | "muted";

export type CardProps = ViewProps & { tone?: Tone; padded?: boolean };

/** Rounded container used for every content block in the design. */
export function Card({
  tone = "surface",
  padded = true,
  style,
  ...rest
}: CardProps) {
  styles.useVariants({ tone, padded });
  return <View style={[styles.card, style]} {...rest} />;
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radius.lg,
    variants: {
      tone: {
        surface: { backgroundColor: theme.colors.surface },
        dark: { backgroundColor: theme.colors.brandDark },
        brand: { backgroundColor: theme.colors.brand },
        muted: { backgroundColor: theme.colors.surfaceAlt },
      },
      padded: {
        true: { padding: theme.spacing.lg },
        false: {},
      },
    },
  },
}));
