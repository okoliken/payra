import { useState } from 'react';
import { View } from 'react-native';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet } from 'react-native-unistyles';
import { AppText, Button, Header, Input, Screen } from '@/components/ui';
import { ProgressBar } from '@/components/progress-dots';
import { useStore } from '@/store/app-store';

/**
 * Figma "Home Address" (402×874): nav 64 (progress 60%) → 24 → title block → 24 →
 * form at y=234, 368 wide, gap 24 (Street No / Apartment No side by side, gap 16) → Continue at y=760.
 */
export default function HomeAddressScreen() {
  const router = useGuardedRouter();
  const { updateUser } = useStore();
  const [form, setForm] = useState({ street: '', streetNo: '', apartmentNo: '', city: '', region: '', zip: '' });
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));
  const valid = form.street.trim() && form.city.trim() && form.region.trim() && form.zip.trim();

  return (
    <Screen scroll>
      <Header center={<ProgressBar percent={60} />} />

      <View style={styles.titleBlock}>
        <AppText variant="h4" weight="semiBold">
          Home Address
        </AppText>
        <AppText variant="body" tone="secondary">
          Enter your current residential address to continue.
        </AppText>
      </View>

      <View style={styles.form}>
        <Input label="Street Address" placeholder="Enter your street name and house number" value={form.street} onChangeText={set('street')} autoCapitalize="words" />
        <View style={styles.row}>
          <Input label="Street No" placeholder="Street no" value={form.streetNo} onChangeText={set('streetNo')} keyboardType="number-pad" containerStyle={styles.half} />
          <Input label="Apartment No" placeholder="Apartment no" value={form.apartmentNo} onChangeText={set('apartmentNo')} containerStyle={styles.half} />
        </View>
        <Input label="City" placeholder="Enter your city" value={form.city} onChangeText={set('city')} autoCapitalize="words" />
        <Input label="Region" placeholder="Enter your state or region" value={form.region} onChangeText={set('region')} autoCapitalize="words" />
        <Input label="Zip Code" placeholder="Enter your postal code" value={form.zip} onChangeText={set('zip')} keyboardType="number-pad" />
      </View>

      <View style={styles.spacer} />
      <Button
        title="Continue"
        disabled={!valid}
        onPress={() => {
          const number = [form.streetNo, form.apartmentNo ? `Apt ${form.apartmentNo}` : ''].filter(Boolean).join(', ');
          updateUser({ address: [`${number ? `${number} ` : ''}${form.street.trim()}`, `${form.city.trim()}, ${form.region.trim()} ${form.zip.trim()}`].join(', ') });
          router.push('/(auth)/almost-there');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  titleBlock: { gap: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  form: { gap: theme.spacing.xxl },
  row: { flexDirection: 'row', gap: theme.spacing.lg },
  half: { flex: 1 },
  spacer: { flex: 1, minHeight: theme.spacing.xxl },
}));
