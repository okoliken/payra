import { useMemo, useRef } from 'react';
import { useRouter, type Href } from 'expo-router';

/** Minimum gap between two navigations. Anything faster is a double tap, not intent. */
const LOCK_MS = 700;

/**
 * `useRouter` with a re-entrancy guard. Expo Router happily runs `push`/`replace` for every tap
 * (expo/expo#38483), so a quick double tap stacks the same screen twice. Calls made while a
 * navigation is in flight are dropped; pushes are also `dangerouslySingular` so the same route
 * never appears twice in a row on the stack.
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
      back: () => guard(() => router.back()),
    };
  }, [router]);
}
