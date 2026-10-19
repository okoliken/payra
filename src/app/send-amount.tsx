import { useLocalSearchParams } from 'expo-router';
import { useGuardedRouter } from '@/lib/navigation';
import { Header, Screen } from '@/components/ui';
import { AmountEntry } from '@/components/amount-entry';
import { contacts } from '@/data/mock';
import { useStore } from '@/store/app-store';

export default function SendAmountScreen() {
  const router = useGuardedRouter();
  const { contactId } = useLocalSearchParams<{ contactId: string }>();
  const { balance, addTransaction } = useStore();
  const contact = contacts.find((c) => c.id === contactId) ?? contacts[0]!;

  return (
    <Screen>
      <Header title="Transfer" />
      <AmountEntry
        contact={contact}
        cta="Send Money"
        max={balance}
        onSubmit={(amount) => {
          addTransaction({ title: 'Transfer', kind: 'sent', amount: -amount, category: contact.name });
          router.replace({ pathname: '/success', params: { title: 'Transfer Successful!', body: `You sent $${amount.toFixed(2)} to ${contact.name}.` } });
        }}
      />
    </Screen>
  );
}
