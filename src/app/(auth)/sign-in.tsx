import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AppText, BottomSheet, Button, Header, Input, Screen } from '@/components/ui';
import { AppIcon } from '@/components/app-icon';
import { wait } from '@/lib/format';

/**
 * Figma "Sign In" (402×874): nav 64 (back only) → 24 → title block (gap 8) → 24 →
 * form at y=234, gap 24: Username, Password (eye icon), Remember-me row, Sign In button;
 * then 24 → "Don't have an account? Sign Up".
 */
export default function SignInScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const submit = async () => {
    setLoading(true);
    await wait(600); // pretend to talk to a server
    setLoading(false);
    router.push('/(auth)/pin');
  };

  return (
    <Screen scroll>
      <Header showBack={router.canGoBack()} />
      <View style={styles.titleBlock}>
        <AppText variant="h4" weight="semiBold">
          Welcome Back
        </AppText>
        <AppText variant="body" tone="secondary">
          Sign in to your account
        </AppText>
      </View>

      <View style={styles.form}>
        <Input label="Username" placeholder="Enter your username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Input label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} secure />
        <View style={styles.row}>
          <Pressable onPress={() => setRemember((r) => !r)} style={styles.remember} accessibilityRole="checkbox" accessibilityState={{ checked: remember }}>
            <View style={[styles.checkbox, remember && styles.checkboxOn]}>{remember ? <AppIcon name="check" size={15} color={theme.colors.brand} /> : null}</View>
            <AppText variant="body">Remember me</AppText>
          </Pressable>
          <Pressable onPress={() => setForgotOpen(true)} hitSlop={8}>
            <AppText variant="body" weight="semiBold" tone="onBrand">
              Forgot Password?
            </AppText>
          </Pressable>
        </View>
        <Button title="Sign In" loading={loading} disabled={!username || !password} onPress={submit} />
      </View>

      <View style={styles.inline}>
        <AppText variant="body" tone="secondary">
          Don&apos;t have an account?
        </AppText>
        <Link href="/(auth)/getting-started" replace>
          <AppText variant="body" weight="semiBold" tone="onBrand">
            Sign Up
          </AppText>
        </Link>
      </View>

      {/* Figma "Sign In - Forgot Password": bottom sheet with illustration, copy and Cancel / Continue. */}
      <BottomSheet visible={forgotOpen} onClose={() => setForgotOpen(false)}>
        <View style={styles.sheetArt}>
          <AppText variant="display" weight="bold" tone="onBrand">
            ?
          </AppText>
        </View>
        <AppText variant="h4" weight="semiBold" align="center">
          Forgot Password?
        </AppText>
        <AppText variant="body" tone="secondary" align="center" style={styles.sheetBody}>
          Don&apos;t worry! Follow a few steps to set a new Password and get back in
        </AppText>
        <View style={styles.sheetActions}>
          <Button title="Cancel" variant="outline" style={styles.sheetButton} onPress={() => setForgotOpen(false)} />
          <Button
            title="Continue"
            style={styles.sheetButton}
            onPress={() => {
              setForgotOpen(false);
              router.push({ pathname: '/(auth)/forgot-password', params: { kind: 'password' } });
            }}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  titleBlock: { gap: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  form: { gap: theme.spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  remember: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 1.5, borderColor: theme.colors.stroke.strong, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: theme.colors.brandDark, borderColor: theme.colors.brandDark },
  inline: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xxl },
  // TODO(figma-assets): replace with the exported question-mark illustration PNG.
  sheetArt: { alignSelf: 'center', width: 160, height: 160, borderRadius: 80, backgroundColor: theme.colors.brand, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xxl },
  sheetBody: { marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  sheetActions: { flexDirection: 'row', gap: theme.spacing.md },
  sheetButton: { flex: 1 },
}));
