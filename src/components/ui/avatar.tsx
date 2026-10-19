import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { AppText } from './text';
import { initials } from '@/lib/format';

type Size = 'sm' | 'md' | 'lg';

export function Avatar({ name, size = 'md' }: { name: string; size?: Size }) {
  styles.useVariants({ size });
  return (
    <View style={styles.circle}>
      <AppText variant={size === 'lg' ? 'h4' : 'captionL'} weight="semiBold">
        {initials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    variants: {
      size: {
        sm: { width: 28, height: 28 },
        md: { width: 40, height: 40 },
        lg: { width: 72, height: 72 },
      },
    },
  },
}));
