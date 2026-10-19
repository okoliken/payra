import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Tone = 'background' | 'dark' | 'brand';

type BaseProps = {
  tone?: Tone;
  /** Adds horizontal gutters (default true). */
  gutter?: boolean;
  /** Extra bottom padding so content clears the floating tab bar. */
  tabBarInset?: boolean;
  /** Pad below the status bar (default true). Turn off for edge-to-edge screens. */
  safeTop?: boolean;
};

export type ScreenProps = ViewProps & BaseProps & { scroll?: false };
export type ScrollScreenProps = ScrollViewProps & BaseProps & { scroll: true };

/** Full-screen background that respects safe-area insets via Unistyles' runtime. */
export function Screen(props: ScreenProps | ScrollScreenProps) {
  const { tone = 'background', gutter = true, tabBarInset = false, safeTop = true } = props;
  styles.useVariants({ tone, gutter, tabBarInset, safeTop });

  if (props.scroll) {
    const { scroll: _s, tone: _t, gutter: _g, tabBarInset: _b, safeTop: _st, contentContainerStyle, style, ...rest } = props;
    return (
      <ScrollView
        style={[styles.root, style]}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...rest}
      />
    );
  }

  const { scroll: _s, tone: _t, gutter: _g, tabBarInset: _b, safeTop: _st, style, ...rest } = props;
  return <View style={[styles.root, styles.content, style]} {...rest} />;
}

const styles = StyleSheet.create((theme, rt) => ({
  root: {
    flex: 1,
    variants: {
      tone: {
        background: { backgroundColor: theme.colors.background },
        dark: { backgroundColor: theme.colors.brandDark },
        brand: { backgroundColor: theme.colors.brand },
      },
      gutter: { true: {}, false: {} },
      tabBarInset: { true: {}, false: {} },
      safeTop: { true: {}, false: {} },
    },
  },
  content: {
    variants: {
      safeTop: {
        true: { paddingTop: rt.insets.top },
        false: {},
      },
      tone: { background: {}, dark: {}, brand: {} },
      gutter: {
        true: { paddingHorizontal: theme.spacing.gutter },
        false: {},
      },
      tabBarInset: {
        true: { paddingBottom: rt.insets.bottom + 96 },
        false: { paddingBottom: rt.insets.bottom + theme.spacing.lg },
      },
    },
  },
  scrollContent: {
    flexGrow: 1,
    variants: {
      safeTop: {
        true: { paddingTop: rt.insets.top },
        false: {},
      },
      tone: { background: {}, dark: {}, brand: {} },
      gutter: {
        true: { paddingHorizontal: theme.spacing.gutter },
        false: {},
      },
      tabBarInset: {
        true: { paddingBottom: rt.insets.bottom + 96 },
        false: { paddingBottom: rt.insets.bottom + theme.spacing.lg },
      },
    },
  },
}));
