import { Text, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'bodyL' | 'body' | 'captionL' | 'captionS';
type Weight = 'regular' | 'medium' | 'semiBold' | 'bold';
type Tone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'brand'
  | 'onBrand'
  | 'onDark'
  | 'onDarkMuted'
  | 'danger'
  | 'success'
  | 'warning';

export type AppTextProps = TextProps & {
  variant?: Variant;
  weight?: Weight;
  tone?: Tone;
  align?: 'left' | 'center' | 'right';
};

export function AppText({ variant = 'body', weight = 'regular', tone = 'primary', align = 'left', style, ...rest }: AppTextProps) {
  styles.useVariants({ variant, weight, tone, align });
  // Follows the system text size (Dynamic Type), capped so the fixed Figma layouts still hold.
  return <Text maxFontSizeMultiplier={1.35} style={[styles.text, style]} {...rest} />;
}

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      variant: {
        display: theme.typography.display,
        h1: theme.typography.h1,
        h2: theme.typography.h2,
        h3: theme.typography.h3,
        h4: theme.typography.h4,
        h5: theme.typography.h5,
        bodyL: theme.typography.bodyL,
        body: theme.typography.body,
        captionL: theme.typography.captionL,
        captionS: theme.typography.captionS,
      },
      weight: {
        regular: { fontFamily: theme.fonts.regular },
        medium: { fontFamily: theme.fonts.medium },
        semiBold: { fontFamily: theme.fonts.semiBold },
        bold: { fontFamily: theme.fonts.bold },
      },
      tone: {
        primary: { color: theme.colors.text },
        secondary: { color: theme.colors.textSecondary },
        tertiary: { color: theme.colors.textTertiary },
        brand: { color: theme.colors.brand },
        onBrand: { color: theme.colors.onBrand },
        onDark: { color: theme.colors.onBrandDark },
        onDarkMuted: { color: 'rgba(255,255,255,0.72)' },
        danger: { color: theme.colors.danger },
        success: { color: theme.colors.success },
        warning: { color: theme.colors.warning },
      },
      align: {
        left: { textAlign: 'left' },
        center: { textAlign: 'center' },
        right: { textAlign: 'right' },
      },
    },
  },
}));
