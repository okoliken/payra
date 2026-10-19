import { Easing, FadeIn, FadeInDown } from "react-native-reanimated";

/**
 * One motion language for the app: short, quiet, no overshoot. Things fade in and travel a few
 * points at most; presses answer with a highlight, not a bounce.
 */
export const EASE = Easing.out(Easing.cubic);

/** Fade in while rising 6pt. */
export const rise = (delay = 0) =>
  FadeInDown.delay(delay)
    .duration(260)
    .easing(EASE)
    .withInitialValues({ opacity: 0, transform: [{ translateY: 6 }] });

/** Plain fade. */
export const fade = (delay = 0) => FadeIn.delay(delay).duration(220).easing(EASE);

/** Small horizontal shake for rejected input (error haptic goes with it). */
export const SHAKE = [-6, 6, -4, 4, -2, 0];
