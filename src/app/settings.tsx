import { Switch } from 'react-native';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';
import { Globe, Languages, Moon, Trash2 } from 'lucide-react-native';
import { AppText, Header, ListRow, Screen } from '@/components/ui';
import { useStore } from '@/store/app-store';

export default function SettingsScreen() {
  const { theme } = useUnistyles();
  const { setTheme } = useStore();
  const dark = theme.name === 'dark';
  return (
    <Screen>
      <Header title="General Settings" />
      <ListRow
        card
        icon={<Moon size={18} color={theme.colors.text} />}
        title="Dark Theme"
        subtitle={`Currently ${UnistylesRuntime.themeName}. Unistyles swaps every StyleSheet live.`}
        right={<Switch value={dark} onValueChange={(v) => setTheme(v ? 'dark' : 'light')} trackColor={{ true: theme.colors.brandDark, false: theme.colors.fill.strong }} thumbColor={dark ? theme.colors.brand : theme.colors.surface} />}
      />
      <ListRow card chevron icon={<Languages size={18} color={theme.colors.text} />} title="Change Language" subtitle="English (US)" onPress={() => {}} />
      <ListRow card chevron icon={<Globe size={18} color={theme.colors.text} />} title="Change Timezone" subtitle="GMT+7 · Jakarta" onPress={() => {}} />
      <ListRow card icon={<Trash2 size={18} color={theme.colors.danger} />} title="Delete Account" subtitle="Permanently remove your Payra account" right={<AppText variant="captionL" tone="danger">Demo only</AppText>} />
    </Screen>
  );
}
