import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AppText, Button, Header, Screen } from '@/components/ui';
import { AppIcon, type IconName } from '@/components/app-icon';
import { maskPhone } from '@/lib/format';
import { useStore } from '@/store/app-store';

/**
 * Figma "Forgot Password" / "Forgot PIN" (402×874): nav 64 (back only) → 24 → title block → 24 →
 * two option cards (icon circle, label + masked value, radio on the right; selected card carries
 * the Brand/Secondary border) → Continue at y=760. Layout taken from the frame capture; exact
 * paddings still to be measured (see docs/figma-flow.md).
 */
export default function ForgotPasswordScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { user } = useStore();
  const { kind = 'password' } = useLocalSearchParams<{ kind?: 'password' | 'pin' }>();
  const [via, setVia] = useState<'sms' | 'email'>('sms');

  const options: { key: 'sms' | 'email'; label: string; value: string; icon: IconName }[] = [
    { key: 'sms', label: 'Via SMS', value: maskPhone(user.phone), icon: 'smartphone' },
    { key: 'email', label: 'Via Email', value: user.email.replace(/^(.)(.+)(.@.+)$/, (_, a, b, c) => `${a}${'*'.repeat(Math.min(b.length, 6))}${c}`), icon: 'letter' },
  ];

  return (
    <Screen>
      <Header />
      <View style={styles.titleBlock}>
        <AppText variant="h4" weight="semiBold">
          {kind === 'pin' ? 'Forgot PIN' : 'Forgot Password'}
        </AppText>
        <AppText variant="body" tone="secondary">
          Please select the following options to reset your password
        </AppText>
      </View>

      <View style={styles.options}>
        {options.map((opt) => {
          const active = via === opt.key;
          return (
            <Pressable key={opt.key} onPress={() => setVia(opt.key)} style={[styles.option, active && styles.optionActive]} accessibilityRole="radio" accessibilityState={{ selected: active }}>
              <View style={styles.iconWrap}>
                <AppIcon name={opt.icon} size={20} color={theme.colors.text} />
              </View>
              <View style={styles.optionBody}>
                <AppText variant="body" weight="semiBold">
                  {opt.label}
                </AppText>
                <AppText variant="captionL" tone="secondary">
                  {opt.value}
                </AppText>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />
      <Button title="Continue" onPress={() => router.push({ pathname: '/(auth)/verify', params: { flow: 'reset', kind } })} />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  titleBlock: { gap: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  options: { gap: theme.spacing.lg },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1.5,
    borderColor: theme.colors.stroke.soft,
  },
  optionActive: { borderColor: theme.colors.brandDark },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.field, borderWidth: 1, borderColor: theme.colors.stroke.soft, alignItems: 'center', justifyContent: 'center' },
  optionBody: { flex: 1, gap: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.stroke.strong, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: theme.colors.brandDark, borderWidth: 2 },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.brandDark },
  spacer: { flex: 1 },
}));
