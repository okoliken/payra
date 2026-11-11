import { Image, Pressable, View } from 'react-native';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AppText, Header, IconCircle, Screen } from '@/components/ui';
import { AppIcon, type IconName } from '@/components/app-icon';
import { useStore } from '@/store/app-store';
import * as Haptics from 'expo-haptics';

const menu: { icon: IconName; title: string; subtitle: string }[] = [
  { icon: 'shield-check', title: 'Account Security', subtitle: 'Secure your account with PIN, fingerprint, and protection settings.' },
  { icon: 'bell-bing', title: 'Notification', subtitle: 'Stay in control of alerts, updates, and notification preferences.' },
  { icon: 'settings', title: 'General Settings', subtitle: 'Customize your app, manage preferences, and access account options.' },
];

const socials: { icon: IconName; label: string }[] = [
  { icon: 'instagram', label: 'Instagram' },
  { icon: 'x-twitter', label: 'X' },
  { icon: 'tiktok', label: 'TikTok' },
  { icon: 'facebook', label: 'Facebook' },
];

/** Figma "Profile" (799:6986). */
export default function ProfileScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const user = useStore((s) => s.user);
  const tap = () => Haptics.selectionAsync().catch(() => {});

  return (
    <Screen scroll tabBarInset>
      <Header title="Profile" onBack={() => router.navigate('/(tabs)')} />

      <View style={styles.identity}>
        <View style={styles.identityLeft}>
          <View style={styles.avatarRing}>
            <Image source={require('@/../assets/images/profile-avatar.png')} style={styles.avatar} />
          </View>
          <View style={styles.gap2}>
            <AppText variant="h5" weight="semiBold">
              {user.name}
            </AppText>
            <AppText variant="body" tone="tertiary">
              {user.email}
            </AppText>
          </View>
        </View>
        <Pressable onPress={tap} hitSlop={8} accessibilityRole="button">
          <AppText variant="captionL" weight="semiBold" tone="success">
            Edit Profile
          </AppText>
        </Pressable>
      </View>

      <View style={styles.qr}>
        <View style={styles.gap8}>
          <AppText variant="body" weight="semiBold">
            My QR
          </AppText>
          <AppText variant="captionL" tone="secondary">
            Access your personal QR for quick and seamless payments.
          </AppText>
        </View>
        <Pressable style={({ pressed }) => [styles.qrButton, pressed && styles.pressed]} onPress={tap} accessibilityRole="button">
          <AppText variant="captionL" weight="semiBold" tone="onBrand">
            Show QR
          </AppText>
          <AppIcon name="qr-code" size={16} color={theme.colors.brandDark} />
        </Pressable>
      </View>

      <View style={styles.menu}>
        {menu.map((item) => (
          <Pressable key={item.title} style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={tap} accessibilityRole="button">
            <IconCircle>
              <AppIcon name={item.icon} size={24} color={theme.colors.brandDark} />
            </IconCircle>
            <View style={styles.rowBody}>
              <AppText variant="body" weight="semiBold">
                {item.title}
              </AppText>
              <AppText variant="captionL" tone="tertiary">
                {item.subtitle}
              </AppText>
            </View>
            <AppIcon name="alt-arrow-right" size={24} color={theme.colors.brandDark} />
          </Pressable>
        ))}
      </View>

      <View style={styles.follow}>
        <AppText variant="body" weight="semiBold">
          Follow us on:
        </AppText>
        <View style={styles.socials}>
          {socials.map((s) => (
            <Pressable key={s.icon} onPress={tap} accessibilityRole="button" accessibilityLabel={s.label}>
              <IconCircle>
                <AppIcon name={s.icon} size={24} color={theme.colors.brandDark} />
              </IconCircle>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

// Figma: cards Background/B1, padding 18; identity + menu rows r18, QR r24; 24 between
// blocks, 18 under "Follow us on".
const styles = StyleSheet.create((theme) => ({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceRaised,
  },
  identityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
    backgroundColor: theme.colors.background,
  },
  avatar: { width: 44, height: 44, borderRadius: 25, backgroundColor: '#F6D3BD' },
  gap2: { gap: 2 },
  gap8: { gap: 8 },
  qr: {
    gap: 18,
    marginTop: 24,
    padding: 18,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceRaised,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 36,
    borderRadius: 24,
    backgroundColor: theme.colors.brand,
  },
  menu: { gap: 16, marginTop: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceRaised,
  },
  rowBody: { flex: 1, gap: 6 },
  pressed: { opacity: 0.7 },
  follow: { gap: 18, marginTop: 24 },
  socials: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceRaised,
  },
}));
