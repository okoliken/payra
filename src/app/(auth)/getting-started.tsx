import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { FontAwesome } from '@expo/vector-icons';
import { ChevronDown } from 'lucide-react-native';
import { AppText, Button, Header, Input, Screen } from '@/components/ui';
import { ProgressBar } from '@/components/progress-dots';
import { countries } from '@/data/mock';
import { useStore } from '@/store/app-store';

/**
 * Figma "Getting Started" (402×874):
 *  nav 64 → 24 → title block (gap 8) → 24 → form (label 20 / 8 / field 48 / 32 / button 48 / 24 / sign-in row)
 *  → 64 → "Or continue with" (16) → OAuth row 48 → … → footer 300 wide at y=776.
 */
export default function GettingStartedScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { countryCode } = useStore();
  const country = countries.find((c) => c.code === countryCode) ?? countries[4]!;
  const [phone, setPhone] = useState('');
  const valid = phone.replace(/\D/g, '').length >= 8;

  return (
    <Screen scroll>
      <Header center={<ProgressBar percent={15} />} />

      <View style={styles.titleBlock}>
        <AppText variant="h4" weight="semiBold">
          Getting Started
        </AppText>
        <AppText variant="body" tone="secondary">
          Use your mobile number to get started with Payra
        </AppText>
      </View>

      <Input
        label="Phone number"
        placeholder="000 0000 0000"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        left={
          <Pressable onPress={() => router.push('/country-code')} style={styles.country} hitSlop={6}>
            <AppText style={styles.flag}>{country.flag}</AppText>
            <ChevronDown size={18} color={theme.colors.text} strokeWidth={1.5} />
            {/* Figma renders "+" and "62" as two texts with a 2pt gap */}
            <View style={styles.dialCode}>
              <AppText variant="body" weight="semiBold">
                +
              </AppText>
              <AppText variant="body" weight="semiBold">
                {country.code.replace('+', '')}
              </AppText>
            </View>
          </Pressable>
        }
      />

      <View style={styles.cta}>
        <Button title="Send me the code" disabled={!valid} onPress={() => router.push({ pathname: '/(auth)/verify', params: { phone: `${country.code} ${phone}` } })} />
      </View>

      <View style={styles.inline}>
        <AppText variant="body" tone="secondary">
          Already have an account?
        </AppText>
        <Link href="/(auth)/sign-in" replace>
          <AppText variant="body" weight="semiBold" tone="onBrand">
            Sign In
          </AppText>
        </Link>
      </View>

      <View style={styles.oauth}>
        <AppText variant="captionL" weight="semiBold" align="center">
          Or continue with :
        </AppText>
        <View style={styles.social}>
          <Button title="Google" variant="outline" style={styles.socialButton} iconLeft={<FontAwesome name="google" size={20} color={theme.colors.text} />} onPress={() => router.push('/(auth)/pin')} />
          <Button title="Apple" variant="outline" style={styles.socialButton} iconLeft={<FontAwesome name="apple" size={20} color={theme.colors.text} />} onPress={() => router.push('/(auth)/pin')} />
        </View>
      </View>

      <View style={styles.spacer} />
      <AppText variant="body" tone="secondary" align="center" style={styles.footer}>
        By creating an account you agree to our{' '}
        <AppText variant="body" weight="semiBold" tone="onBrand">
          Terms and Conditions
        </AppText>
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  titleBlock: { gap: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  country: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  flag: { fontSize: 18, lineHeight: 22 },
  dialCode: { flexDirection: 'row', gap: 2, marginLeft: theme.spacing.xs },
  cta: { marginTop: theme.spacing.xxxl },
  inline: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xxl },
  oauth: { marginTop: 64, gap: theme.spacing.lg },
  social: { flexDirection: 'row', gap: theme.spacing.lg },
  socialButton: { flex: 1 },
  spacer: { flex: 1, minHeight: theme.spacing.xxxl },
  footer: { alignSelf: 'center', maxWidth: 300 },
}));
