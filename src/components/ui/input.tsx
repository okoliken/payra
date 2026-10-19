import { forwardRef, useState } from 'react';
import { Pressable, TextInput, type TextInputProps, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AppText } from './text';
import { AppIcon } from '@/components/app-icon';

export type InputProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Adds the show/hide toggle for password fields. */
  secure?: boolean;
  containerStyle?: object;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, hint, error, left, right, secure, containerStyle, style, ...rest },
  ref,
) {
  const { theme } = useUnistyles();
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);
  styles.useVariants({ focused, error: !!error });

  return (
    <View style={containerStyle}>
      {label ? (
        <AppText variant="body" weight="semiBold" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View style={styles.field}>
        {left ? <View style={styles.side}>{left}</View> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, style]}
          {...rest}
        />
        {secure ? (
          <Pressable hitSlop={8} onPress={() => setHidden((h) => !h)} style={styles.side}>
            <AppIcon name={hidden ? 'eye' : 'eye-closed'} size={20} color={theme.colors.text} />
          </Pressable>
        ) : right ? (
          <View style={styles.side}>{right}</View>
        ) : null}
      </View>
      {error ? (
        <AppText variant="captionL" tone="danger" style={styles.hint}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="captionL" tone="secondary" style={styles.hint}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create((theme) => ({
  label: { marginBottom: theme.spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.field,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    variants: {
      focused: {
        true: { borderColor: theme.colors.brandDark },
        false: { borderColor: theme.colors.stroke.soft },
      },
      error: {
        true: { borderColor: theme.colors.danger },
      },
    },
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  side: { alignItems: 'center', justifyContent: 'center' },
  hint: { marginTop: theme.spacing.xs },
}));
