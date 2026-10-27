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
        onChangeText={(t) => onChangeText(t.replace(/[\r\n]+/g, ' '))}
        placeholderTextColor={theme.colors.textSecondary}
        returnKeyType="search"
        autoCorrect={false}
        maxFontSizeMultiplier={1.35}
        multiline
        scrollEnabled={false}
        submitBehavior="blurAndSubmit"
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
  // A multiline (UITextView) box with scrolling off, filling the bar. A text view lays its text
  // out from the top by these insets, whereas the single-line UITextField re-centres by whichever
  // font metrics UIKit picks and has been seen drifting the text to the bottom of the bar after
  // interaction. Plus Jakarta Sans at 14pt is 17.6pt tall by its hhea metrics (ascent 14.5,
  // descent 3.1), so a 20pt line with 14pt above and below sits the caps on the bar's centre,
  // and the full 48pt box means nothing can clip. Pasted newlines are flattened in onChangeText.
  input: {
    flex: 1,
    alignSelf: 'stretch',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 0,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body.fontSize,
    lineHeight: 20,
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
