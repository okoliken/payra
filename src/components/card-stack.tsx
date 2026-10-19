import { useEffect, useRef, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, runOnUI, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import * as Haptics from 'expo-haptics';
import { BankCard } from '@/components/bank-card';
import type { Card } from '@/data/mock';

/** Figma "My Wallet": the back card's top 62.22pt shows above the 200pt front card. */
const CARD_HEIGHT = 200;
const PEEK = 62.22;
const SWIPE_THRESHOLD = 80;
const SPRING = { damping: 20, stiffness: 190, mass: 0.8 };

type Slot = { x: SharedValue<number>; y: SharedValue<number>; z: SharedValue<number>; opacity: SharedValue<number> };

function useSlot(front: boolean): Slot {
  return { x: useSharedValue(0), y: useSharedValue(front ? PEEK : 0), z: useSharedValue(front ? 1 : 0), opacity: useSharedValue(1) };
}

/**
 * Two persistent slots hold the visible cards; their positions live entirely in shared values,
 * so a swipe never waits on a React re-render. The front slot flies off, the back slot glides
 * down into the front position, then the roles swap on the UI thread and the emptied slot fades
 * back in at the top with the next card. Nothing snaps.
 */
export function CardStack({ cards }: { cards: Card[] }) {
  const { width } = useWindowDimensions();
  const { demoSwipe } = useLocalSearchParams<{ demoSwipe?: string }>();
  const count = cards.length;
  const [index, setIndex] = useState(0);
  // Which card each slot is showing; slot 0 starts in front.
  const [slotCards, setSlotCards] = useState<[number, number]>([0, 1]);
  // Refs so a commit fired from a long-lived worklet/timer never reads a stale index.
  const indexRef = useRef(index);
  indexRef.current = index;
  const frontSlot = useSharedValue(0);
  const slots = [useSlot(true), useSlot(false)];
  const slot0 = slots[0]!;
  const slot1 = slots[1]!;

  const commit = (emptiedSlot: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const nextIndex = (indexRef.current + 1) % count;
    indexRef.current = nextIndex;
    setIndex(nextIndex);
    setSlotCards((prev) => {
      const next: [number, number] = [prev[0], prev[1]];
      next[emptiedSlot] = (nextIndex + 1) % count; // the card that will peek next
      return next;
    });
  };

  const flyOut = (direction: 1 | -1, velocity = 0) => {
    'worklet';
    const front = frontSlot.value === 0 ? slot0 : slot1;
    const back = frontSlot.value === 0 ? slot1 : slot0;
    const emptied = frontSlot.value;
    const duration = Math.max(200, Math.min(320, 300 - Math.abs(velocity) / 25));
    back.y.value = withTiming(PEEK, { duration, easing: Easing.out(Easing.cubic) });
    front.x.value = withTiming(direction * (width + 80), { duration, easing: Easing.out(Easing.quad) }, (done) => {
      if (!done) return;
      // Swap roles on the UI thread: the flown-out slot becomes the back slot and fades in at the top.
      front.z.value = 0;
      front.x.value = 0;
      front.y.value = 0;
      front.opacity.value = 0;
      front.opacity.value = withTiming(1, { duration: 220 });
      back.z.value = 1;
      frontSlot.value = 1 - emptied;
      runOnJS(commit)(emptied);
    });
  };

  const pan = Gesture.Pan()
    .enabled(count > 1)
    .activeOffsetX([-10, 10])
    .failOffsetY([-16, 16])
    .onChange((e) => {
      const front = frontSlot.value === 0 ? slot0 : slot1;
      const back = frontSlot.value === 0 ? slot1 : slot0;
      front.x.value = e.translationX;
      back.y.value = Math.min(1, Math.abs(e.translationX) / (width * 0.55)) * PEEK;
    })
    .onEnd((e) => {
      const front = frontSlot.value === 0 ? slot0 : slot1;
      const back = frontSlot.value === 0 ? slot1 : slot0;
      const shouldFly = Math.abs(e.translationX) > SWIPE_THRESHOLD || Math.abs(e.velocityX) > 600;
      if (shouldFly) flyOut(e.translationX >= 0 || e.velocityX > 600 ? 1 : -1, e.velocityX);
      else {
        front.x.value = withSpring(0, SPRING);
        back.y.value = withSpring(0, SPRING);
      }
    });
  const tap = Gesture.Tap()
    .enabled(count > 1)
    .maxDuration(250)
    .onEnd(() => flyOut(1));

  // Dev-only: `payra://wallet?demoSwipe=1` advances the stack on a timer so the motion can be recorded.
  useEffect(() => {
    if (!__DEV__ || !demoSwipe || count < 2) return;
    const t = setInterval(() => runOnUI(flyOut)(1), 1500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoSwipe, count]);

  const style0 = useAnimatedStyle(() => ({
    zIndex: slot0.z.value,
    opacity: slot0.opacity.value,
    transform: [{ translateY: slot0.y.value }, { translateX: slot0.x.value }, { rotate: `${(slot0.x.value / width) * 5}deg` }],
  }));
  const style1 = useAnimatedStyle(() => ({
    zIndex: slot1.z.value,
    opacity: slot1.opacity.value,
    transform: [{ translateY: slot1.y.value }, { translateX: slot1.x.value }, { rotate: `${(slot1.x.value / width) * 5}deg` }],
  }));

  if (count === 0) return null;
  const card0 = cards[slotCards[0] % count]!;
  const card1 = cards[slotCards[1] % count]!;

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <View style={styles.stack} accessibilityRole="button" accessibilityHint="Swipe or tap to show the next card">
        <Animated.View style={[styles.slot, style0]}>
          <BankCard card={card0} />
        </Animated.View>
        {count > 1 ? (
          <Animated.View style={[styles.slot, style1]}>
            <BankCard card={card1} />
          </Animated.View>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  stack: { height: CARD_HEIGHT + PEEK },
  slot: { position: 'absolute', left: 0, right: 0, top: 0 },
});
