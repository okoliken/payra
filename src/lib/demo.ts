/**
 * Demo tour switches. `EXPO_PUBLIC_DEMO=short|full` at build time runs the scripted tour in any
 * build, including Release (for a clean recording with no dev-client chrome). In a dev build the
 * `DEV_DEMO` flag in dev-route.ts does the same. The per-screen demo hooks (`demoType`,
 * `demoPick`, `receipt=1`…) are compiled in whenever either is possible, and only ever act when
 * their param is present.
 */
import { DEV_DEMO } from "@/dev-route";

const env = process.env.EXPO_PUBLIC_DEMO;
export type DemoVariant = "short" | "full";
export const DEMO_MODE: DemoVariant | undefined = env === "short" || env === "full" ? env : __DEV__ && DEV_DEMO ? "full" : undefined;
export const DEMO_HOOKS = __DEV__ || !!env;

type Handler = (payload: string) => void;
const handlers = new Map<string, Set<Handler>>();
/** Tiny event bus so the tour can press things on a mounted screen (keypad keys, for now). */
export const demoBus = {
  on(event: string, handler: Handler) {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
    return () => {
      handlers.get(event)?.delete(handler);
    };
  },
  emit(event: string, payload: string) {
    handlers.get(event)?.forEach((h) => h(payload));
  },
};
