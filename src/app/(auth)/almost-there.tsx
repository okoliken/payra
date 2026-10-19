import { Pressable, View } from 'react-native';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AppText, Button, Header, Screen } from '@/components/ui';
import { AppIcon } from '@/components/app-icon';
import { ProgressBar } from '@/components/progress-dots';
import { useStore } from '@/store/app-store';

/**
 * Figma "Almost There!" (402×874): nav 64 (progress 75%) → 24 → title block → 24 →
 * review form (Input component, State = filled, edit icon right) gap 24; Date of Birth is a
 * three-field row; Continue at y=760.
 */
export default function AlmostThereScreen() {
  const router = useGuardedRouter();
  const { user, signIn } = useStore();
  const dob = user.dob ?? { dd: '01', mm: '01', yyyy: '1991' };

  return (
    <Screen scroll>
      <Header center={<ProgressBar percent={75} />} />

      <View style={styles.titleBlock}>
        <AppText variant="h4" weight="semiBold">
          Almost There!
        </AppText>
        <AppText variant="body" tone="secondary">
          Please take a momet to ensure all of the information you provide is correct
        </AppText>
      </View>

      <View style={styles.form}>
        <ReviewField label="Full Name" value={user.name} onEdit={() => router.push('/(auth)/personal-info')} />
        <View>
          <AppText variant="body" weight="semiBold" style={styles.label}>
            Date of Birth
          </AppText>
          <View style={styles.row}>
            <ReviewField value={dob.dd} style={styles.third} onEdit={() => router.push('/(auth)/personal-info')} />
            <ReviewField value={dob.mm} style={styles.third} onEdit={() => router.push('/(auth)/personal-info')} />
            <ReviewField value={dob.yyyy} style={styles.third} onEdit={() => router.push('/(auth)/personal-info')} />
          </View>
        </View>
        <ReviewField label="Residential Address" value={user.address} onEdit={() => router.push('/(auth)/home-address')} />
      </View>

      <View style={styles.spacer} />
      <Button
        title="Continue"
        onPress={() => {
          signIn();
          router.push('/(auth)/pin');
        }}
      />
    </Screen>
  );
}

/** Figma Input component in its filled state with the edit (pen) icon on the right. */
function ReviewField({ label, value, onEdit, style }: { label?: string; value: string; onEdit: () => void; style?: object }) {
  const { theme } = useUnistyles();
  return (
    <View style={style}>
      {label ? (
        <AppText variant="body" weight="semiBold" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Pressable onPress={onEdit} style={styles.field}>
        <AppText variant="body" style={styles.value} numberOfLines={1}>
          {value}
        </AppText>
        <AppIcon name="pen" size={18} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  titleBlock: { gap: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  form: { gap: theme.spacing.xxl },
  label: { marginBottom: theme.spacing.sm },
  row: { flexDirection: 'row', gap: theme.spacing.lg },
  third: { flex: 1 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    height: 48,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.field,
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
  },
  value: { flex: 1 },
  spacer: { flex: 1, minHeight: theme.spacing.xxl },
}));
