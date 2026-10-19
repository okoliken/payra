import { View, type ViewProps } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Tone = "surface" | "dark" | "brand" | "muted";

export type CardProps = ViewProps & { tone?: Tone; padded?: boolean };

/** Figma content container: Background/B1, r24, padding 18. */
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
    borderRadius: theme.radius.xxl,
    variants: {
      tone: {
        surface: { backgroundColor: theme.colors.surfaceRaised },
        dark: { backgroundColor: theme.colors.brandDark },
        brand: { backgroundColor: theme.colors.brand },
        muted: { backgroundColor: theme.colors.surfaceAlt },
      },
      padded: {
        true: { padding: 18 },
        false: {},
      },
    },
  },
}));
