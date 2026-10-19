import { Switch } from 'react-native';
import { useGuardedRouter } from '@/lib/navigation';
import { useUnistyles } from 'react-native-unistyles';
import { Fingerprint, KeyRound, Lock } from 'lucide-react-native';
import { Header, ListRow, Screen } from '@/components/ui';
import { useStore } from '@/store/app-store';

export default function AccountSecurityScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { fingerprint, toggleFingerprint } = useStore();
  return (
    <Screen>
      <Header title="Account Security" />
      <ListRow card chevron icon={<Lock size={18} color={theme.colors.text} />} title="Change PIN" subtitle="Keep your account secure by updating your PIN" onPress={() => router.push('/(auth)/pin')} />
      <ListRow card chevron icon={<KeyRound size={18} color={theme.colors.text} />} title="Forgot PIN" subtitle="Recover your PIN through secure verification" onPress={() => router.push('/(auth)/forgot-password')} />
      <ListRow
        card
        icon={<Fingerprint size={18} color={theme.colors.text} />}
        title="Fingerprint"
        subtitle="Enable fingerprint for quick and secure access"
        right={<Switch value={fingerprint} onValueChange={() => toggleFingerprint()} trackColor={{ true: theme.colors.brandDark, false: theme.colors.fill.strong }} thumbColor={fingerprint ? theme.colors.brand : theme.colors.surface} />}
      />
    </Screen>
  );
}
