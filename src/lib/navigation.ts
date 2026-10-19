import { useMemo, useRef } from 'react';
import { useRouter, type Href } from 'expo-router';

/** Minimum gap between two forward navigations. Anything faster is a double tap, not intent. */
const LOCK_MS = 500;

/**
 * `useRouter` with a double-tap guard on forward navigation. Expo Router runs `push`/`replace`
 * for every tap (expo/expo#38483), so a quick double tap stacks the same screen twice; pushes are
 * also `dangerouslySingular` so the same route never appears twice in a row. `back` is never
 * guarded: dropping a back tap made the back button feel stuck right after a screen opened.
 */
export function useGuardedRouter() {
  const router = useRouter();
  const lastAt = useRef(0);

  return useMemo(() => {
    const guard = (fn: () => void) => {
      const now = Date.now();
      if (now - lastAt.current < LOCK_MS) return;
      lastAt.current = now;
      fn();
    };
    return {
      ...router,
      push: (href: Href) => guard(() => router.push(href, { dangerouslySingular: true })),
      navigate: (href: Href) => guard(() => router.navigate(href)),
      replace: (href: Href) => guard(() => router.replace(href)),
    };
  }, [router]);
}
