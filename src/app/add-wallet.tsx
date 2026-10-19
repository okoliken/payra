import { useState } from 'react';
import { View } from 'react-native';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet } from 'react-native-unistyles';
import { Button, Card, Header, Input, Screen } from '@/components/ui';
import { BankCard } from '@/components/bank-card';
import { useStore } from '@/store/app-store';

export default function AddWalletScreen() {
  const router = useGuardedRouter();
  const { addCard } = useStore();
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [bank, setBank] = useState('');
  const digits = number.replace(/\D/g, '');
  const valid = digits.length === 16 && /^\d{2}\/\d{2}$/.test(expiry) && bank.trim().length > 1;

  const preview = {
    id: 'preview',
    brand: digits.startsWith('4') ? ('visa' as const) : ('mastercard' as const),
    type: 'Debit Card' as const,
    last4: digits.slice(-4) || '0000',
    expiry: expiry ? expiry.replace('/', ' / ') : 'MM / YY',
    balance: 0,
    tone: 'dark' as const,
  };

  return (
    <Screen scroll>
      <Header title="Add New Wallet" />
      <BankCard card={preview} placeholder={digits.length < 4} />
      <Card style={styles.form}>
        <Input label="Card Number" placeholder="0000 0000 0000 0000" keyboardType="number-pad" maxLength={19} value={number} onChangeText={(t) => setNumber(t.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19))} />
        <Input label="Expiry" placeholder="MM/YY" keyboardType="number-pad" maxLength={5} value={expiry} onChangeText={(t) => setExpiry(t.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/').slice(0, 5))} />
        <Input label="Bank" placeholder="Enter your bank" value={bank} onChangeText={setBank} autoCapitalize="words" />
      </Card>
      <View style={styles.spacer} />
      <Button
        title="Add New Wallet"
        disabled={!valid}
        onPress={() => {
          addCard({ ...preview, id: `k${Date.now()}`, tone: 'dark' });
          router.back();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: { gap: theme.spacing.md, marginTop: theme.spacing.md },
  spacer: { flex: 1, minHeight: theme.spacing.xxl },
}));
