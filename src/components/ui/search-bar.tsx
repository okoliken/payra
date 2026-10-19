import { TextInput, View, type TextInputProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AppIcon } from '@/components/app-icon';

/**
 * Figma "Search Bar" component: 48 tall, r12, Background/B1 fill, 1px Stroke/Secondary outside,
 * padding 16 / 12, gap 12, `search` icon + Body placeholder.
 */
export function SearchBar(props: TextInputProps) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.bar}>
      <AppIcon name="search" size={20} color={theme.colors.text} />
      <TextInput placeholderTextColor={theme.colors.textSecondary} returnKeyType="search" clearButtonMode="while-editing" {...props} style={[styles.input, props.style]} />
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
  input: { flex: 1, paddingVertical: 0, fontFamily: theme.fonts.regular, fontSize: theme.typography.body.fontSize, color: theme.colors.text },
}));
