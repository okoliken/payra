import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet } from 'react-native-unistyles';
import { AppText, Button, Header, OtpInput, Screen } from '@/components/ui';
import { ProgressBar } from '@/components/progress-dots';

/**
 * Figma "Verification Code" (402×874): nav 64 (progress 30%) → 24 → title block → 24 →
 * six OTP boxes at y=234 → 12 → "Resend code in 2:20" → Verify button pinned above the keyboard.
 */
export default function VerifyScreen() {
  const router = useGuardedRouter();
  const { flow, kind } = useLocalSearchParams<{ flow?: 'reset'; kind?: 'password' | 'pin' }>();
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(140);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60));
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <Header center={<ProgressBar percent={30} />} />
        <View style={styles.titleBlock}>
          <AppText variant="h4" weight="semiBold">
            Verification Code
          </AppText>
          <AppText variant="body" tone="secondary">
            We&apos;ve sent a verification code to your phone number.
          </AppText>
        </View>
        <OtpInput value={code} onChange={setCode} />
        <AppText variant="bodyL" tone="secondary" style={styles.resend}>
          {seconds > 0 ? (
            <>
              Resend code in{' '}
              <AppText variant="bodyL" weight="semiBold" tone="primary">
                {mm}:{ss}
              </AppText>
            </>
          ) : (
            <AppText variant="bodyL" weight="semiBold" tone="primary" onPress={() => setSeconds(140)}>
              Resend code
            </AppText>
          )}
        </AppText>
        <View style={styles.spacer} />
        <Button title="Verify" disabled={code.length < 6} onPress={() => router.push(flow !== 'reset' ? '/(auth)/personal-info' : kind === 'pin' ? { pathname: '/(auth)/pin', params: { mode: 'create' } } : '/(auth)/create-password')} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  fill: { flex: 1 },
  titleBlock: { gap: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  resend: { marginTop: theme.spacing.xxl },
  spacer: { flex: 1, minHeight: theme.spacing.xxl },
}));
