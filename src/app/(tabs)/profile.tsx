import { Pressable, View } from 'react-native';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Bell, LogOut, QrCode, Settings, ShieldCheck } from 'lucide-react-native';
import { AppText, Avatar, Button, Card, Header, ListRow, Screen } from '@/components/ui';
import { useStore } from '@/store/app-store';

export default function ProfileScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { user, signOut } = useStore();

  return (
    <Screen scroll tabBarInset>
      <Header title="Profile" showBack={false} />
      <Card style={styles.identity}>
        <Avatar name={user.name} />
        <View style={styles.identityBody}>
          <AppText variant="bodyL" weight="semiBold">
            {user.name}
          </AppText>
          <AppText variant="captionL" tone="secondary">
            {user.email}
          </AppText>
        </View>
        <Pressable onPress={() => router.push('/edit-profile')}>
          <AppText variant="captionL" weight="semiBold" tone="success">
            Edit Profile
          </AppText>
        </Pressable>
      </Card>

      <Card style={styles.qr}>
        <AppText variant="body" weight="semiBold">
          My QR
        </AppText>
        <AppText variant="captionL" tone="secondary">
          Access your personal QR for quick and seamless payments.
        </AppText>
        <Button title="Show QR" size="md" icon={<QrCode size={16} color={theme.colors.onBrand} />} onPress={() => router.push('/request')} />
      </Card>

      <ListRow card chevron icon={<ShieldCheck size={18} color={theme.colors.text} />} title="Account Security" subtitle="Secure your account with PIN, fingerprint, and protection settings." onPress={() => router.push('/account-security')} />
      <ListRow card chevron icon={<Bell size={18} color={theme.colors.text} />} title="Notification" subtitle="Stay in control of alerts, updates, and notification preferences." onPress={() => router.push('/notifications')} />
      <ListRow card chevron icon={<Settings size={18} color={theme.colors.text} />} title="General Settings" subtitle="Customize your app, manage preferences, and access account options." onPress={() => router.push('/settings')} />

      <Button
        title="Log Out"
        variant="soft"
        icon={<LogOut size={16} color={theme.colors.text} />}
        onPress={() => {
          signOut();
          router.replace('/(auth)/sign-in');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  identity: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  identityBody: { flex: 1 },
  qr: { gap: theme.spacing.sm, marginBottom: theme.spacing.md },
}));
