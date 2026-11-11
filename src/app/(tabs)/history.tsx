import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { AppText, Header, Screen, SearchBar, Segmented } from '@/components/ui';
import { TransactionRow } from '@/components/transaction-row';
import { EmptyState } from '@/components/brand-marks';
import type { Transaction } from '@/data/mock';
import { dayLabel } from '@/lib/format';
import { useStore } from '@/store/app-store';
import { useGuardedRouter } from '@/lib/navigation';

type Filter = 'all' | 'received' | 'send';

/**
 * Figma "History" (402×874): nav 64 (back + "History") → 24 → title block (gap 8) → 24 →
 * 18 → search bar + segmented control (gap 16) → 18 → day groups 18 apart: Body SemiBold date
 * header, 18, then cards at gap 16. Amounts are unsigned, green for money in and red for money out.
 */
export default function HistoryScreen() {
  const router = useGuardedRouter();
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
      <Header title="History" onBack={() => router.navigate('/(tabs)')} />
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
            <View style={styles.rows}>
              {items.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  titleBlock: { gap: theme.spacing.sm, marginBottom: 18 },
  controls: { gap: theme.spacing.lg, marginBottom: 18 },
  group: { gap: 18, marginBottom: 18 },
  rows: { gap: theme.spacing.lg },
}));
