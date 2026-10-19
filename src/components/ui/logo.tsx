import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Svg, { Path } from 'react-native-svg';
import { AppText } from './text';

type Props = { size?: number; wordmark?: boolean; onDark?: boolean };

/** Payra logo mark, exact Figma vector (40×30): Brand/Secondary plate with a Brand/Primary "p." */
export function Logo({ size = 40, wordmark = true, onDark = false }: Props) {
  const plate = onDark ? '#ECF0AF' : '#0B4647';
  const glyph = onDark ? '#0B4647' : '#ECF0AF';
  return (
    <View style={styles.row}>
      <Svg width={size} height={size * 0.75} viewBox="0 0 40 30" fill="none">
        <Path d="M0 22.75V0L29.8701 5.87608e-05L40 9.50004V30H7.53247L0 22.75Z" fill={plate} />
        <Path
          d="M13.5065 6.58843C14.8153 5.01091 16.8304 4.00005 19.0909 4.00005C23.0358 4.00005 26.2338 7.07809 26.2338 10.875C26.2338 14.672 23.0358 17.75 19.0909 17.75C16.8303 17.75 14.8153 16.739 13.5065 15.1614V22.75H7.53247V4.00005H13.5065V6.58843Z"
          fill={glyph}
        />
        <Path d="M25.7143 18.75H29.8701V22.75H25.7143V18.75Z" fill={glyph} />
      </Svg>
      {wordmark ? (
        <AppText variant="h4" weight="semiBold" tone={onDark ? "onDark" : "onBrand"} style={{ fontSize: size * 0.5, lineHeight: size * 0.7 }}>
          Payra.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
}));
