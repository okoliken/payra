import { Text, type TextProps } from '@okoli/ui';
import { StyleSheet } from 'react-native-unistyles';

type PayraTone = 'brand' | 'onBrand' | 'onDark' | 'onDarkMuted';

export type AppTextProps = Omit<TextProps, 'tone'> & {
  tone?: NonNullable<TextProps['tone']> | PayraTone;
};

/** @okoli/ui's Text, plus Payra's brand tones. */
export function AppText({ tone = 'primary', style, ...rest }: AppTextProps) {
  if (tone === 'onBrand') return <Text tone="onPrimary" style={style} {...rest} />;
  if (tone === 'onDark') return <Text tone="onSecondary" style={style} {...rest} />;
  if (tone === 'brand') return <Text style={[styles.brand, style]} {...rest} />;
  if (tone === 'onDarkMuted') return <Text style={[styles.onDarkMuted, style]} {...rest} />;
  return <Text tone={tone} style={style} {...rest} />;
}

const styles = StyleSheet.create((theme) => ({
  brand: { color: theme.colors.brand },
  onDarkMuted: { color: 'rgba(255,255,255,0.72)' },
}));
