import { useState } from 'react';
import { View } from 'react-native';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet } from 'react-native-unistyles';
import { AppText, Button, Header, Input, Screen } from '@/components/ui';
import { ProgressBar } from '@/components/progress-dots';
import { useStore } from '@/store/app-store';

/**
 * Figma "Personal Information" (402×874): nav 64 → 24 → title block (gap 8) → 24 →
 * form gap 24: Full Name, Email, Date of Birth (label → 12 → DD / MM / YY row, gap 16) → Continue at y=760.
 */
export default function PersonalInfoScreen() {
  const router = useGuardedRouter();
  const { updateUser } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState({ dd: '', mm: '', yy: '' });
  const valid = name.trim().length > 2 && /\S+@\S+\.\S+/.test(email) && dob.dd && dob.mm && dob.yy;

  return (
    <Screen scroll>
      <Header center={<ProgressBar percent={PROGRESS} />} />

      <View style={styles.titleBlock}>
        <AppText variant="h4" weight="semiBold">
          Personal Information
        </AppText>
        <AppText variant="body" tone="secondary">
          We ask for your personal information to verify your identity
        </AppText>
      </View>

      <View style={styles.form}>
        <Input label="Full Name" placeholder="Enter your full name" value={name} onChangeText={setName} autoCapitalize="words" />
        <Input label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <View>
          <AppText variant="body" weight="semiBold" style={styles.label}>
            Date of Birth
          </AppText>
          <View style={styles.row}>
            <Input placeholder="DD" keyboardType="number-pad" maxLength={2} value={dob.dd} onChangeText={(dd) => setDob((d) => ({ ...d, dd }))} containerStyle={styles.third} />
            <Input placeholder="MM" keyboardType="number-pad" maxLength={2} value={dob.mm} onChangeText={(mm) => setDob((d) => ({ ...d, mm }))} containerStyle={styles.third} />
            <Input placeholder="YY" keyboardType="number-pad" maxLength={4} value={dob.yy} onChangeText={(yy) => setDob((d) => ({ ...d, yy }))} containerStyle={styles.third} />
          </View>
        </View>
      </View>

      <View style={styles.spacer} />
      <Button
        title="Continue"
        disabled={!valid}
        onPress={() => {
          updateUser({ name: name.trim(), email: email.trim(), dob: { dd: dob.dd, mm: dob.mm, yyyy: dob.yy } });
          router.push('/(auth)/home-address');
        }}
      />
    </Screen>
  );
}

// Figma "Progress Bar" variant on this frame (read from the component's Fill property).
const PROGRESS = 45;

const styles = StyleSheet.create((theme) => ({
  titleBlock: { gap: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  form: { gap: theme.spacing.xxl },
  label: { marginBottom: theme.spacing.md },
  row: { flexDirection: 'row', gap: theme.spacing.lg },
  third: { flex: 1 },
  spacer: { flex: 1, minHeight: theme.spacing.xxl },
}));
