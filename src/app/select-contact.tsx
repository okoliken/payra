import { useMemo, useState } from 'react';
import { Pressable, SectionList, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Search } from 'lucide-react-native';
import { AppText, Avatar, Card, Header, Input, Screen } from '@/components/ui';
import { contacts, type Contact } from '@/data/mock';

export default function SelectContactScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { next } = useLocalSearchParams<{ next?: 'send-amount' | 'request-amount' }>();
  const [query, setQuery] = useState('');

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = contacts.filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q));
    const map = new Map<string, Contact[]>();
    for (const c of list) map.set(c.name[0]!, [...(map.get(c.name[0]!) ?? []), c]);
    return [...map.entries()].map(([title, data]) => ({ title, data }));
  }, [query]);

  const pick = (c: Contact) =>
    router.replace({ pathname: next === 'request-amount' ? '/request-amount' : '/send-amount', params: { contactId: c.id } });

  return (
    <Screen>
      <Header title="Select Contact" />
      <View style={styles.searchRow}>
        <Input containerStyle={styles.search} placeholder="Type a name or phone number" value={query} onChangeText={setQuery} left={<Search size={18} color={theme.colors.textSecondary} />} />
        <Pressable onPress={() => router.back()}>
          <AppText variant="body" weight="semiBold" tone="danger">
            Cancel
          </AppText>
        </Pressable>
      </View>
      <AppText variant="body" weight="semiBold" style={styles.title}>
        My Contacts
      </AppText>
      <Card padded={false} style={styles.list}>
        <SectionList
          sections={sections}
          keyExtractor={(c) => c.id}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={() => null}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => pick(item)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
              <Avatar name={item.name} />
              <View>
                <AppText variant="body" weight="semiBold">
                  {item.name}
                </AppText>
                <AppText variant="captionL" tone="secondary">
                  {item.phone}
                </AppText>
              </View>
            </Pressable>
          )}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  search: { flex: 1 },
  title: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.md },
  list: { flex: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.lg },
  rowPressed: { backgroundColor: theme.colors.surfaceAlt },
  sep: { height: 1, backgroundColor: theme.colors.stroke.soft, marginHorizontal: theme.spacing.lg },
}));
