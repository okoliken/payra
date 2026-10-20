import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { AppText, Header, Screen, SearchBar, Segmented } from '@/components/ui';
import { TransactionRow } from '@/components/transaction-row';
import { EmptyState } from '@/components/brand-marks';
import type { Transaction } from '@/data/mock';
import { dayLabel } from '@/lib/format';
import { useStore } from '@/store/app-store';

type Filter = 'all' | 'received' | 'send';

/**
 * Figma "History" (402×874): nav 64 (back + "History") → 24 → title block (gap 8) → 24 →
 * search bar + segmented control (gap 16) → day groups: Body SemiBold date header, then cards,
 * everything at gap 16. Amounts are unsigned, green for money in and red for money out.
 */
export default function HistoryScreen() {
  const { transactions } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = transactions.filter((tx) => {
      if (filter === 'received' && tx.amount <= 0) return false;
      if (filter === 'send' && tx.amount >= 0) return false;
      return !q || tx.title.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
    });
    const map = new Map<string, Transaction[]>();
    for (const tx of visible) {
      const key = dayLabel(tx.at);
      map.set(key, [...(map.get(key) ?? []), tx]);
    }
    return [...map.entries()];
  }, [transactions, filter, query]);

  return (
    <Screen scroll tabBarInset>
      <Header title="History" />
      <View style={styles.titleBlock}>
        <AppText variant="h4" weight="semiBold">
          Transactions History
        </AppText>
        <AppText variant="body" tone="secondary">
          Complete history of all your transactions
        </AppText>
      </View>

      <View style={styles.controls}>
        <SearchBar placeholder="Search transactions..." value={query} onChangeText={setQuery} />
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'received', label: 'Received' },
            { value: 'send', label: 'Send' },
          ]}
        />
      </View>

      {groups.length === 0 ? (
        <EmptyState title="No transactions found" body={query ? "Try a different name or filter" : "Money you send or receive shows up here"} />
      ) : (
        groups.map(([day, items]) => (
          <View key={day} style={styles.group}>
            <AppText variant="body" weight="semiBold">
              {day}
            </AppText>
            {items.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  titleBlock: { gap: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  controls: { gap: theme.spacing.lg, marginBottom: theme.spacing.lg },
  group: { gap: theme.spacing.lg, marginBottom: theme.spacing.lg },
}));
