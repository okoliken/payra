import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Bell, ChevronDown, Droplets, Info, Plus, Search, Tv, Wifi, Zap, Smartphone, Fuel, GraduationCap, HeartPulse } from 'lucide-react-native';
import { AppText, Button, Card, Header, Input, Screen, Segmented } from '@/components/ui';
import { prepaidAmounts } from '@/data/mock';
import { useStore } from '@/store/app-store';

type Tab = 'prepaid' | 'bills' | 'services';
const titles: Record<string, string> = { electricity: 'Electricity', water: 'Water', internet: 'Internet', more: 'More' };
const providers = { electricity: 'PLN', water: 'PDAM', internet: 'IndiHome' } as const;

export default function BillScreen() {
  const { type = 'electricity' } = useLocalSearchParams<{ type: string }>();
  if (type === 'more') return <MoreScreen />;
  if (type === 'electricity') return <ElectricityScreen />;
  return <UtilityScreen type={type} />;
}

function ElectricityScreen() {
  const router = useGuardedRouter();
  const { addTransaction } = useStore();
  const [tab, setTab] = useState<Tab>('prepaid');
  const [customerId, setCustomerId] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const ready = customerId.replace(/\D/g, '').length >= 6 && (tab !== 'prepaid' || selected !== null);

  const pay = () => {
    const amount = tab === 'prepaid' ? prepaidAmounts[selected!]!.price : 42.15;
    addTransaction({ title: tab === 'prepaid' ? 'Electricity Token' : 'Electricity Bill', kind: 'bill', amount: -amount, category: tab === 'prepaid' ? 'Prepaid' : 'Bills' });
    router.replace({ pathname: '/success', params: { title: 'Payment Successful!', body: `$${amount.toFixed(2)} paid for electricity (${customerId}).` } });
  };

  return (
    <Screen scroll>
      <Header title="Electricity" />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'prepaid', label: 'Prepaid' },
          { value: 'bills', label: 'Bills' },
          { value: 'services', label: 'Services' },
        ]}
      />
      <Card style={styles.block}>
        <Input label="Customer ID" placeholder="Enter customer ID" keyboardType="number-pad" value={customerId} onChangeText={setCustomerId} />
      </Card>
      {tab === 'prepaid' ? (
        <>
          <View style={styles.notice}>
            <Info size={14} color="#0B4647" />
            <AppText variant="captionL" tone="onBrand" style={styles.noticeText}>
              Prepaid transactions are unavailable daily from 23:00 to 01:00.
            </AppText>
          </View>
          <View style={styles.grid}>
            {prepaidAmounts.map((a, i) => {
              const active = selected === i;
              return (
                <Pressable key={a.price} onPress={() => setSelected(i)} style={[styles.tile, active && styles.tileActive]}>
                  <AppText variant="body" weight="semiBold">
                    ${a.price.toFixed(2)}
                  </AppText>
                  <View style={styles.tileToken}>
                    <AppText variant="captionL" tone="secondary">
                      ${a.token.toFixed(2)} token
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : tab === 'bills' ? (
        <Card style={styles.block}>
          <AppText variant="body" weight="semiBold">
            Postpaid bill
          </AppText>
          <AppText variant="captionL" tone="secondary">
            We&apos;ll fetch this month&apos;s outstanding bill for the customer ID above.
          </AppText>
        </Card>
      ) : (
        <Card style={styles.block}>
          <AppText variant="body" weight="semiBold">
            Services
          </AppText>
          <AppText variant="captionL" tone="secondary">
            New connection, capacity change and reconnection requests.
          </AppText>
        </Card>
      )}
      <View style={styles.spacer} />
      <Button title={tab === 'prepaid' ? 'Buy Token' : 'Check Bill'} disabled={!ready} onPress={pay} />
    </Screen>
  );
}

function UtilityScreen({ type }: { type: string }) {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { addTransaction } = useStore();
  const [customerId, setCustomerId] = useState('');
  const provider = providers[type as keyof typeof providers] ?? 'Select Provider';
  const title = titles[type] ?? 'Bill';

  return (
    <Screen>
      <Header title={title} />
      <Card style={styles.block}>
        <AppText variant="body" weight="semiBold">
          Provider
        </AppText>
        <Pressable style={styles.select}>
          <AppText variant="body" tone="secondary">
            {provider}
          </AppText>
          <ChevronDown size={16} color={theme.colors.textSecondary} />
        </Pressable>
        <Input label="Customer ID" placeholder="Enter your customer ID" keyboardType="number-pad" value={customerId} onChangeText={setCustomerId} />
      </Card>
      <View style={styles.spacer} />
      <Button
        title="Check Bill"
        disabled={customerId.length < 6}
        onPress={() => {
          const amount = type === 'water' ? 18.4 : 29.99;
          addTransaction({ title: `${title} Bill`, kind: 'bill', amount: -amount, category: provider });
          router.replace({ pathname: '/success', params: { title: 'Payment Successful!', body: `$${amount.toFixed(2)} paid to ${provider}.` } });
        }}
      />
    </Screen>
  );
}

const services = [
  { key: 'electricity', label: 'Electricity', Icon: Zap },
  { key: 'water', label: 'Water', Icon: Droplets },
  { key: 'internet', label: 'Internet', Icon: Wifi },
  { key: 'tv', label: 'Cable TV', Icon: Tv },
  { key: 'mobile', label: 'Mobile', Icon: Smartphone },
  { key: 'gas', label: 'Gas', Icon: Fuel },
  { key: 'education', label: 'Education', Icon: GraduationCap },
  { key: 'health', label: 'Insurance', Icon: HeartPulse },
];

function MoreScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const [query, setQuery] = useState('');
  const visible = services.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <Screen scroll>
      <Header title="More" />
      <Input placeholder="Search services or merchants" value={query} onChangeText={setQuery} left={<Search size={18} color={theme.colors.textSecondary} />} />
      <Card style={[styles.block, { marginTop: theme.spacing.md }]}>
        <AppText variant="body" weight="semiBold">
          20+ payment methods available for your bills
        </AppText>
        <AppText variant="body" weight="semiBold" style={{ marginTop: theme.spacing.xs }}>
          Add Bill Reminder
        </AppText>
        <AppText variant="captionL" tone="secondary">
          Get reminders so you never miss a payment.
        </AppText>
        <Button title="Add" size="md" icon={<Plus size={14} color={theme.colors.onBrand} />} onPress={() => router.push('/notifications')} />
      </Card>
      <Card style={styles.block}>
        <AppText variant="body" weight="semiBold">
          Bills
        </AppText>
        <View style={styles.serviceGrid}>
          {visible.map(({ key, label, Icon }) => (
            <Pressable key={key} onPress={() => router.push(key === 'electricity' || key === 'water' || key === 'internet' ? `/bills/${key}` : '/bills/internet')} style={styles.service}>
              <View style={styles.serviceIcon}>
                <Icon size={18} color={theme.colors.text} />
              </View>
              <AppText variant="captionS" tone="secondary" align="center">
                {label}
              </AppText>
            </Pressable>
          ))}
        </View>
        <View style={styles.reminder}>
          <Bell size={14} color={theme.colors.textSecondary} />
          <AppText variant="captionL" tone="secondary">
            Reminders are sent 3 days before each due date.
          </AppText>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  block: { gap: theme.spacing.md, marginTop: theme.spacing.md },
  notice: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.brand, marginTop: theme.spacing.md },
  noticeText: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginTop: theme.spacing.md },
  tile: { width: '47.5%', padding: theme.spacing.lg, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, gap: theme.spacing.sm, borderWidth: 1.5, borderColor: 'transparent' },
  tileActive: { borderColor: theme.colors.brandDark },
  tileToken: { padding: theme.spacing.sm, borderRadius: theme.radius.sm, backgroundColor: theme.colors.surfaceAlt },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48, paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceAlt },
  spacer: { flex: 1, minHeight: theme.spacing.xxl },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: theme.spacing.lg },
  service: { width: '25%', alignItems: 'center', gap: 6 },
  serviceIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  reminder: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
}));
