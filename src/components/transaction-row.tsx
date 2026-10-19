import { View } from 'react-native';
import { Tappable } from '@/components/tappable';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AppText, IconCircle } from '@/components/ui';
import { AppIcon, type IconName } from '@/components/app-icon';
import type { Transaction } from '@/data/mock';
import { timeLabel } from '@/lib/format';

const iconFor: Record<Transaction['kind'], IconName> = {
  received: 'arrow-left-down',
  topup: 'arrow-left-down',
  sent: 'arrow-right-up',
  subscription: 'card',
  bill: 'card',
};

/**
 * Figma transaction card (History / Home): 370×84, padding 18, r18, Background/B1;
 * IconCircle (48/40) with a 24pt Solar icon in Text/Primary, gap 12; text columns gap 6;
 * title Body SemiBold, status Caption Text/Tertiary; amount Body SemiBold in Green/Default or
 * Red/Default (no sign, as designed), meta "Category · HH:MM" Caption Text/Tertiary.
 * Tapping opens the transaction's receipt.
 */
export function TransactionRow({ tx }: { tx: Transaction }) {
  const { theme } = useUnistyles();
  const router = useGuardedRouter();
  const positive = tx.amount > 0;
  const amount = `$${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (
    <Tappable style={styles.card} onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: tx.id } })}>
      <IconCircle>
        <AppIcon name={iconFor[tx.kind]} size={24} color={theme.colors.text} />
      </IconCircle>
      <View style={styles.body}>
        <AppText variant="body" weight="semiBold" numberOfLines={1}>
          {tx.title}
        </AppText>
        <AppText variant="captionL" tone={tx.status === 'Failed' ? 'danger' : 'tertiary'}>
          {tx.status}
        </AppText>
      </View>
      <View style={styles.right}>
        <AppText variant="body" weight="semiBold" tone={positive ? 'success' : 'danger'}>
          {amount}
        </AppText>
        <AppText variant="captionL" tone="tertiary">
          {tx.category} · {timeLabel(tx.at)}
        </AppText>
      </View>
    </Tappable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: 18,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceRaised,
  },
  body: { flex: 1, gap: 6 },
  right: { alignItems: 'flex-end', gap: 6 },
}));
