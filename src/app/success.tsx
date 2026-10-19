import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Check } from 'lucide-react-native';
import { AppText, Button, Screen } from '@/components/ui';

/**
 * Figma "Password Changed!" / "PIN Changed!" (402×874): centred illustration, H4 title,
 * Body secondary copy, Primary "OK" button at y=760. No nav bar.
 * TODO(figma-assets): swap the placeholder art for the exported illustration PNG.
 */
export default function SuccessScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { title = 'Success!', body = '', next } = useLocalSearchParams<{ title?: string; body?: string; next?: string }>();
  return (
    <Screen>
      <View style={styles.center}>
        <View style={styles.art}>
          <View style={styles.check}>
            <Check size={44} color={theme.colors.brand} strokeWidth={3.5} />
          </View>
        </View>
        <View style={styles.copy}>
          <AppText variant="h4" weight="semiBold" align="center">
            {title}
          </AppText>
          <AppText variant="body" tone="secondary" align="center">
            {body}
          </AppText>
        </View>
      </View>
      <Button title="OK" onPress={() => (next ? router.replace(next as never) : router.dismissAll?.() ?? router.replace('/(tabs)'))} />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  art: { width: 200, height: 160, borderRadius: 80, backgroundColor: theme.colors.brand, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xxl },
  check: { width: 96, height: 96, borderRadius: 24, backgroundColor: theme.colors.brandDark, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  copy: { gap: theme.spacing.sm, maxWidth: 300 },
}));
