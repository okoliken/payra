import { View } from 'react-native';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Plus, QrCode, Share2, Store } from 'lucide-react-native';
import { AppText, Button, Card, Header, Logo, Screen } from '@/components/ui';

export default function RequestScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  return (
    <Screen scroll>
      <Header title="Request" />
      <Card style={styles.block}>
        <AppText variant="body" weight="semiBold">
          Choose from Contacts
        </AppText>
        <AppText variant="body" weight="medium">
          It&apos;s still empty
        </AppText>
        <AppText variant="captionL" tone="secondary">
          Pick a contact and tell them how much you&apos;d like.
        </AppText>
        <Button title="New Request" size="md" icon={<Plus size={14} color={theme.colors.onBrand} />} onPress={() => router.push({ pathname: '/select-contact', params: { next: 'request-amount' } })} />
      </Card>
      <Card style={styles.block}>
        <AppText variant="body" weight="semiBold">
          Request via QR
        </AppText>
        <AppText variant="captionL" tone="secondary">
          Ask your friends to scan this QR code using their e-wallet app.
        </AppText>
        <View style={styles.qrWrap}>
          <View style={styles.qr}>
            <QrCode size={150} color={theme.colors.text} strokeWidth={1} />
            <View style={styles.qrLogo}>
              <Logo size={28} wordmark={false} />
            </View>
          </View>
          <AppText variant="captionL" tone="secondary" align="center">
            Scan the code
          </AppText>
        </View>
        <Button title="Share Code" size="md" icon={<Share2 size={14} color={theme.colors.onBrand} />} onPress={() => {}} />
        <Button title="Use QRIS for your business transactions" size="md" variant="outline" icon={<Store size={14} color={theme.colors.text} />} onPress={() => {}} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  block: { gap: theme.spacing.md, marginBottom: theme.spacing.md },
  qrWrap: { alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.md, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceAlt },
  qr: { alignItems: 'center', justifyContent: 'center' },
  qrLogo: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.brand, alignItems: 'center', justifyContent: 'center' },
}));
