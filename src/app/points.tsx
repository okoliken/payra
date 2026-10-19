import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Coins } from 'lucide-react-native';
import { AppText, Button, Card, Header, Screen } from '@/components/ui';
import { pointHistory } from '@/data/mock';
import { useStore } from '@/store/app-store';

const days = [5, 10, 10, 15, 25, 100];

export default function PointsScreen() {
  const { theme } = useUnistyles();
  const { user, checkedInToday, checkIn } = useStore();
  const [tab, setTab] = useState<'earned' | 'redeemed'>('earned');
  const rows = pointHistory[tab];

  return (
    <Screen>
      <Header title="Points" />
      <Card tone="dark" style={styles.hero}>
        <View style={styles.heroRow}>
          <AppText variant="bodyL" weight="semiBold" tone="onDark">
            Hello, {user.name.split(' ')[0]}
          </AppText>
          <View style={styles.tier}>
            <AppText variant="captionS" weight="semiBold" tone="onBrand">
              {user.tier}
            </AppText>
          </View>
        </View>
        <View style={styles.pointsRow}>
          <Coins size={18} color={theme.colors.brand} />
          <AppText variant="h4" weight="semiBold" tone="onDark">
            {user.points} Point
          </AppText>
        </View>
        <AppText variant="captionL" tone="onDarkMuted">
          Active until 31 Dec 2026
        </AppText>
      </Card>

      <Card style={styles.checkin}>
        <View style={styles.days}>
          {days.map((d, i) => {
            const today = i === 0;
            return (
              <View key={i} style={styles.day}>
                <View style={[styles.dayBox, today && styles.dayBoxToday]}>
                  <AppText variant="captionL" weight="semiBold">
                    +{d}
                  </AppText>
                  <Coins size={12} color={theme.colors.text} />
                </View>
                <AppText variant="captionS" weight={today ? 'semiBold' : 'regular'} tone={today ? 'primary' : 'secondary'}>
                  {today ? 'Today' : `Day ${i + 1}`}
                </AppText>
              </View>
            );
          })}
        </View>
        <Button title={checkedInToday ? 'Checked in · +5 Coins' : 'Check in Today & Get 5 Coins'} size="md" disabled={checkedInToday} onPress={() => checkIn()} />
      </Card>

      <View style={styles.tabs}>
        {(['earned', 'redeemed'] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={styles.tab}>
            <AppText variant="body" weight={tab === t ? 'semiBold' : 'regular'} tone={tab === t ? 'primary' : 'secondary'} align="center">
              {t === 'earned' ? 'Earned' : 'Redeemed'}
            </AppText>
            {tab === t ? <View style={styles.tabLine} /> : null}
          </Pressable>
        ))}
      </View>

      <AppText variant="body" weight="semiBold" style={styles.dayTitle}>
        Recent
      </AppText>
      {rows.map((r) => (
        <Card key={r.id} style={styles.row}>
          <View style={styles.rowBody}>
            <AppText variant="body" weight="semiBold">
              {r.title}
            </AppText>
            <AppText variant="captionL" tone="secondary">
              {new Date(r.at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} · {new Date(r.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </AppText>
          </View>
          <AppText variant="body" weight="semiBold" tone={r.delta > 0 ? 'success' : 'danger'}>
            {r.delta > 0 ? '+' : '−'} {Math.abs(r.delta)}
          </AppText>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  hero: { gap: theme.spacing.sm, borderRadius: theme.radius.xl },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tier: { paddingHorizontal: 10, height: 22, borderRadius: theme.radius.pill, backgroundColor: theme.colors.brand, justifyContent: 'center' },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  checkin: { marginTop: theme.spacing.md, gap: theme.spacing.lg },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 6 },
  dayBox: { width: 44, height: 44, borderRadius: theme.radius.sm, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  dayBoxToday: { backgroundColor: theme.colors.brand },
  tabs: { flexDirection: 'row', marginTop: theme.spacing.xl },
  tab: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: theme.spacing.sm },
  tabLine: { width: 56, height: 2, backgroundColor: theme.colors.brandDark, borderRadius: 1 },
  dayTitle: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  rowBody: { flex: 1, gap: 2 },
}));
