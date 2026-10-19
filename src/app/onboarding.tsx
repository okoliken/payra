import { useRef, useState } from 'react';
import { FlatList, Pressable, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useGuardedRouter } from '@/lib/navigation';
import { StyleSheet } from 'react-native-unistyles';
import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { AppText, IconButton, Screen } from '@/components/ui';
import { useStore } from '@/store/app-store';

/** Figma frame is 402×874; positions below are measured on that frame and scaled to the device. */
const FRAME_W = 402;
const FRAME_H = 874;

const slides = [
  { key: 's1', title: 'Built for smarter everyday payments', body: 'Manage your balance and payments easily in one secure wallet.', art: 'logo', copyY: 165 },
  { key: 's2', title: 'Designed for fast and secure transactions', body: 'Send money and pay bills instantly with trusted protection.', art: 'wallet', copyY: 529 },
  { key: 's3', title: 'Created to keep your money under control', body: '', art: 'phone', copyY: 608 },
] as const;

type Slide = (typeof slides)[number];

export default function OnboardingScreen() {
  const router = useGuardedRouter();
  const signIn = useStore((s) => s.signIn);
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const finish = () => {
    // The demo skips sign-up: onboarding leads straight into the app.
    signIn();
    router.replace('/(tabs)');
  };

  const goTo = (i: number) => listRef.current?.scrollToIndex({ index: i, animated: true });
  const next = () => (index === slides.length - 1 ? finish() : goTo(index + 1));
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <Screen tone="dark" gutter={false} safeTop={false} style={styles.root}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => <SlideView slide={item} width={width} />}
      />
      <View style={styles.footer}>
        <Pressable onPress={finish} hitSlop={8}>
          <AppText variant="body" weight="medium" tone="brand">
            Skip
          </AppText>
        </Pressable>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <Pressable key={s.key} hitSlop={10} onPress={() => goTo(i)}>
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
        <IconButton tone="brand" size="lg" onPress={next}>
          <ArrowRight size={20} color="#0B4647" />
        </IconButton>
      </View>
    </Screen>
  );
}

function SlideView({ slide, width }: { slide: Slide; width: number }) {
  const { height } = useWindowDimensions();
  const sx = width / FRAME_W;
  const sy = height / FRAME_H;
  return (
    <View style={[styles.slide, { width }]}>
      {slide.art === 'logo' ? (
        // Figma "Image" 389×303 at (95, 449); the export is pre-cropped to the 307px that stay on screen.
        <Image source={art.logo} style={[styles.abs, { top: 449 * sy, right: 0, width: 307 * sx, height: 303 * sy }]} contentFit="fill" />
      ) : slide.art === 'wallet' ? (
        // Figma "Container" (wallet + sparkles) 283×326 at (56, 153).
        <Image source={art.wallet} style={[styles.abs, { top: 153 * sy, left: 56 * sx, width: 283 * sx, height: 326 * sy }]} contentFit="contain" />
      ) : (
        // Figma "Image" (hand + phone) 280×301 at (61, 195).
        <Image source={art.phone} style={[styles.abs, { top: 195 * sy, left: 61 * sx, width: 280 * sx, height: 301 * sy }]} contentFit="contain" />
      )}
      <View style={[styles.abs, styles.copy, { top: slide.copyY * sy }]}>
        <AppText variant="h1" weight="bold" style={styles.title}>
          {slide.title}
        </AppText>
        {slide.body ? (
          <AppText variant="bodyL" style={styles.body}>
            {slide.body}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

// Illustrations exported from the Figma frames (2x/3x PNGs).
const art = {
  logo: require('@/assets/images/onboarding-1.png'),
  wallet: require('@/assets/images/onboarding-2.png'),
  phone: require('@/assets/images/onboarding-3.png'),
};

const styles = StyleSheet.create((theme, rt) => ({
  root: { paddingBottom: rt.insets.bottom },
  slide: { flex: 1, overflow: 'hidden' },
  abs: { position: 'absolute' },
  copy: { left: theme.spacing.gutter, right: theme.spacing.gutter, gap: 18 },
  title: { maxWidth: 300, color: theme.palette.background.b1 },
  body: { maxWidth: 300, color: theme.palette.text.quaternary },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    marginHorizontal: theme.spacing.gutter,
  },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.palette.text.tertiary },
  dotActive: { width: 18, backgroundColor: theme.colors.brand },
}));
