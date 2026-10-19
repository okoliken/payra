import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ChevronRight } from 'lucide-react-native';
import { AppText } from './text';

export type ListRowProps = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  /** Wraps the row in its own white card (Profile / Wallet menus). */
  card?: boolean;
};

export function ListRow({ icon, title, subtitle, right, chevron, onPress, card = false }: ListRowProps) {
  const { theme } = useUnistyles();
  styles.useVariants({ card });
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.body}>
        <AppText variant="body" weight="semiBold">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="captionL" tone="secondary" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
      {chevron ? <ChevronRight size={18} color={theme.colors.textSecondary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    variants: {
      card: {
        true: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
        },
        false: { paddingVertical: theme.spacing.md },
      },
    },
  },
  pressed: { opacity: 0.7 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  subtitle: { marginTop: 2 },
}));
