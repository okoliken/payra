import { useRef } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { X } from 'lucide-react-native';
import { AppIcon } from '@/components/app-icon';

type Props = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  value: string;
  onChangeText: (text: string) => void;
};

/**
 * Figma "Search Bar" component: 48 tall, r12, Background/B1 fill, 1px Stroke/Secondary outside,
 * padding 16 / 12, gap 12, `search` icon + Body placeholder. A clear button fades in whenever
 * there is text (iOS's own only shows while the field is focused) and keeps the keyboard up.
 */
export function SearchBar({ value, onChangeText, style, ...rest }: Props) {
  const { theme } = useUnistyles();
  const input = useRef<TextInput>(null);
  return (
    <View style={styles.bar}>
      <AppIcon name="search" size={18} color={theme.colors.text} />
      <TextInput
        ref={input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={theme.colors.textSecondary}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityRole="search"
        {...rest}
        style={[styles.input, style]}
      />
      {value ? (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)}>
          <Pressable
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => {
              onChangeText('');
              input.current?.focus();
            }}
            style={styles.clear}
          >
            <X size={12} strokeWidth={3} color={theme.colors.surfaceRaised} />
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    height: 48,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
  },
  // Fills the bar's height so nothing clips (a shorter box clips the text once focused), and the
  // bottom padding lifts it: iOS centres Plus Jakarta Sans by its metrics, which sits it ~2pt low.
  input: {
    flex: 1,
    alignSelf: 'stretch',
    paddingTop: 0,
    paddingBottom: 4,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  clear: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.textTertiary,
  },
}));
