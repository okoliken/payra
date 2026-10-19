import { View } from 'react-native';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ChevronLeft } from 'lucide-react-native';
import { AppText } from './text';
import { IconButton } from './icon-button';

export type HeaderProps = {
  title?: string;
  /** Custom centre content (e.g. the sign-up progress bar) instead of a title. */
  center?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  onDark?: boolean;
};

/** Back-button + centred title bar used on every stacked screen. */
export function Header({ title, center, right, onBack, showBack = true, onDark = false }: HeaderProps) {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const iconColor = onDark ? theme.colors.onBrandDark : theme.colors.text;

  return (
    <View style={styles.row}>
      <View style={styles.slot}>
        {showBack ? (
          <IconButton tone={onDark ? 'onDark' : 'surface'} size="lg" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')))}>
            <ChevronLeft size={20} color={iconColor} />
          </IconButton>
        ) : null}
      </View>
      {center ? (
        <View style={[styles.title, styles.center]}>{center}</View>
      ) : title ? (
        <AppText variant="body" weight="semiBold" tone={onDark ? 'onDark' : 'primary'} align="center" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
      ) : (
        <View style={styles.title} />
      )}
      <View style={[styles.slot, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  // Figma "Nav Bar": 64 tall, 48pt buttons, 24 gap to content.
  row: { flexDirection: 'row', alignItems: 'center', height: 64, marginBottom: theme.spacing.xxl },
  slot: { width: 48, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  title: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
}));
