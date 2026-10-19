import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Size = 'lg' | 'md' | 'sm';

/**
 * The double circle Figma uses around icons and initials: a Background/B0 ring with a 6%
 * Stroke/Secondary border, and a Background/B1 disc inside it.
 * lg 48/40 (payments, transactions, contacts) · md 40/32 (frequent transfers) · sm 36/28 (avatar stack).
 */
export function IconCircle({ size = 'lg', children }: { size?: Size; children?: React.ReactNode }) {
  styles.useVariants({ size });
  return (
    <View style={styles.ring}>
      <View style={styles.disc}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
    backgroundColor: theme.colors.background,
    variants: {
      size: {
        lg: { width: 48, height: 48 },
        md: { width: 40, height: 40 },
        sm: { width: 36, height: 36 },
      },
    },
  },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 25,
    backgroundColor: theme.colors.surfaceRaised,
    variants: {
      size: {
        lg: { width: 40, height: 40 },
        md: { width: 32, height: 32 },
        sm: { width: 28, height: 28 },
      },
    },
  },
}));
