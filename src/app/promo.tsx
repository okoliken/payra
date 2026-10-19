import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Gift, PiggyBank } from 'lucide-react-native';
import { AppText, Button, Card, Header, Screen } from '@/components/ui';
import { promos } from '@/data/mock';

type Tab = 'all' | 'savings' | 'online';

export default function PromoScreen() {
  const { theme } = useUnistyles();
  const [tab, setTab] = useState<Tab>('all');
  const visible = promos.filter((p) => tab === 'all' || p.tag === tab);

  return (
    <Screen scroll>
      <Header title="Promo" />
      <View style={styles.tabs}>
        {(['all', 'savings', 'online'] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={styles.tab}>
            <AppText variant="body" weight={tab === t ? 'semiBold' : 'regular'} tone={tab === t ? 'primary' : 'secondary'} align="center">
              {t === 'all' ? 'All' : t === 'savings' ? 'Savings' : 'Online Deals'}
            </AppText>
            {tab === t ? <View style={styles.tabLine} /> : null}
          </Pressable>
        ))}
      </View>
      {visible.map((p) => {
        const dark = p.tone === 'dark';
        const Icon = p.tag === 'savings' ? PiggyBank : Gift;
        return (
          <Card key={p.id} style={styles.item}>
            <Card tone={dark ? 'dark' : 'brand'} style={styles.banner}>
              <View style={styles.bannerCopy}>
                <AppText variant="h5" weight="semiBold" tone={dark ? 'brand' : 'onBrand'}>
                  {p.title}
                </AppText>
                <AppText variant="captionL" tone={dark ? 'onDarkMuted' : 'onBrand'}>
                  {p.subtitle}
                </AppText>
                <Button title={p.cta} size="sm" fullWidth={false} variant={dark ? 'primary' : 'secondary'} onPress={() => {}} />
              </View>
              <Icon size={64} color={dark ? theme.colors.brand : theme.colors.brandDark} strokeWidth={1.25} />
            </Card>
            <AppText variant="bodyL" weight="semiBold">
              {p.headline}
            </AppText>
            <AppText variant="captionL" tone="secondary">
              {p.description}
            </AppText>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  tabs: { flexDirection: 'row', marginBottom: theme.spacing.lg },
  tab: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: theme.spacing.sm },
  tabLine: { width: 56, height: 2, backgroundColor: theme.colors.brandDark, borderRadius: 1 },
  item: { gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  banner: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.xs },
  bannerCopy: { flex: 1, gap: theme.spacing.sm },
}));
