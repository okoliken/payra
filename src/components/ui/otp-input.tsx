import { useEffect, useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { AppText } from './text';

export type OtpInputProps = { length?: number; value: string; onChange: (v: string) => void; autoFocus?: boolean };

/**
 * Figma "Verification Code": six 48×48 Input components (B2 fill, 6% stroke, r12) spread with
 * space-between across the 368pt row; the active box gets the Brand/Secondary stroke.
 * One hidden TextInput drives them so the OS keyboard and SMS autofill work.
 */
export function OtpInput({ length = 6, value, onChange, autoFocus = true }: OtpInputProps) {
  const ref = useRef<TextInput>(null);
  useEffect(() => {
    if (autoFocus) setTimeout(() => ref.current?.focus(), 250);
  }, [autoFocus]);

  const digits = value.split('');
  return (
    <Pressable onPress={() => ref.current?.focus()}>
      <View style={styles.row}>
        {Array.from({ length }).map((_, i) => {
          const active = i === Math.min(value.length, length - 1);
          return (
            <View key={i} style={[styles.box, active && styles.active]}>
              <AppText variant="body" weight="semiBold">
                {digits[i] ?? ''}
              </AppText>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        style={styles.hidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  box: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.field,
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { borderColor: theme.colors.brandDark },
  hidden: { position: 'absolute', opacity: 0, height: 1, width: 1 },
}));
