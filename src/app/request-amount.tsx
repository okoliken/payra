import { useLocalSearchParams } from 'expo-router';
import { useGuardedRouter } from '@/lib/navigation';
import { Header, Screen } from '@/components/ui';
import { AmountEntry } from '@/components/amount-entry';
import { contacts } from '@/data/mock';

export default function RequestAmountScreen() {
  const router = useGuardedRouter();
  const { contactId } = useLocalSearchParams<{ contactId: string }>();
  const contact = contacts.find((c) => c.id === contactId) ?? contacts[0]!;

  return (
    <Screen>
      <Header title="New Request" />
      <AmountEntry
        contact={contact}
        cta="Send Request"
        onSubmit={(amount) =>
          router.replace({ pathname: '/success', params: { title: 'Request Sent!', body: `We asked ${contact.name} for $${amount.toFixed(2)}. You'll be notified when they pay.` } })
        }
      />
    </Screen>
  );
}
