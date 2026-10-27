import { AppState } from "react-native";
import type { useGuardedRouter } from "@/lib/navigation";
import type { DemoVariant } from "@/lib/demo";
import { showTap } from "@/components/demo-taps";
import { demoBus } from "@/lib/demo";
import { beneficiaries, recipientDetail } from "@/data/mock";
import { useStore } from "@/store/app-store";
import { startPaymentActivity } from "../modules/payra-activity";

type Router = ReturnType<typeof useGuardedRouter>;

/**
 * Scripted tours of the app for recording a demo, since the simulator cannot be tapped from a
 * script. Enabled by `EXPO_PUBLIC_DEMO=short|full` at build time (any build) or `DEV_DEMO` in
 * dev-route.ts (dev builds). Every step is a plain route change; screens read `demoPin`,
 * `demoAccount`, `demoBank`, `demoQuery`, `demoPick`, `demoSwipe` and `receipt`
 * params to play their part, and `showTap` draws a touch ripple where a finger would land.
 *
 * Tap points are in window points for the iPhone 17 Pro (402 × 874).
 */
export function runDemoTour(router: Router, variant: DemoVariant) {
  (variant === "short" ? shortTour : fullTour)(router);
}

/** Keypad centres on the Send screen, by key. */
const KEY: Record<string, [number, number]> = {
  "1": [72, 424], "2": [198, 424], "3": [324, 424],
  "4": [72, 520], "5": [198, 520], "6": [324, 520],
  "7": [72, 617], "8": [198, 617], "9": [324, 617],
  ".": [72, 713], "0": [198, 713], "<": [324, 713],
};
const CONTINUE: [number, number] = [201, 800];
const HOME_TRANSFER: [number, number] = [259, 313];
const SEARCH: [number, number] = [201, 174];
const AALIYAH_ROW: [number, number] = [201, 514];
const VIEW_DETAILS: [number, number] = [201, 760];
const SHARE_RECEIPT: [number, number] = [105, 792];

const schedule = (steps: [number, () => void][]) => {
  let at = 0;
  for (const [delay, run] of steps) {
    at += delay;
    setTimeout(run, at);
  }
};

/** Presses a keypad script on the Send screen (ripple + key): 600ms lead, 300ms per key, 900ms per "_" pause. */
const keyTaps = (script: string, from: number): [number, () => void][] => {
  const out: [number, () => void][] = [];
  let at = from + 600;
  let prev = 0;
  for (const ch of script) {
    if (ch === "_") {
      at += 900;
      continue;
    }
    const [x, y] = KEY[ch]!;
    out.push([
      at - prev,
      () => {
        showTap(x, y);
        demoBus.emit("key", ch === "<" ? "del" : ch);
      },
    ]);
    prev = at;
    at += 300;
  }
  return out;
};

const makeTransfer = (router: Router, who: (typeof beneficiaries)[number]) => {
  const tx = useStore.getState().addTransaction({
    title: "Transfer",
    kind: "sent",
    amount: -2500,
    category: who.name,
    detail: recipientDetail(who),
    method: "Payra Users",
  });
  startPaymentActivity({ direction: "outgoing", amount: "$2,500.00", counterparty: who.name, detail: recipientDetail(who), seconds: 14 });
  router.replace({
    pathname: "/success",
    params: { id: tx.id, kind: "transfer", title: "Transfer Successful!", body: `You sent $2,500.00 to ${who.name}` },
  });
  return tx;
};

/** ~30s, hook first: send with the shake, pick a face, success, receipt, card flick. */
function shortTour(router: Router) {
  const who = beneficiaries.find((b) => b.name === "Aaliyah Putri")!;
  const script = "99999_<<<<<_2500";
  let tx: ReturnType<typeof makeTransfer> | undefined;
  schedule([
    [0, () => router.replace("/(tabs)")],
    [1300, () => showTap(...HOME_TRANSFER)],
    [200, () => router.push("/send")],
    ...keyTaps(script, 0),
    [1300, () => showTap(...CONTINUE)],
    [200, () => router.push({ pathname: "/send-to", params: { amount: "2500", demoQuery: "Aal", demoPick: who.name } })],
    [1200, () => showTap(...SEARCH)],
    [3000, () => showTap(...AALIYAH_ROW)],
    [2600, () => { tx = makeTransfer(router, who); }],
    [3000, () => showTap(...VIEW_DETAILS)],
    [200, () => router.replace({ pathname: "/transaction/[id]", params: { id: tx!.id, receipt: "1" } })],
    [2300, () => showTap(...SHARE_RECEIPT)],
    [3700, () => router.replace({ pathname: "/(tabs)/wallet", params: { demoSwipe: "1" } })],
    [3800, () => router.replace("/(tabs)")],
  ]);
}

/** ~65s walkthrough; waits for the recording script to background and resume the app after the transfer. */
function fullTour(router: Router) {
  const store = useStore.getState();
  const who = beneficiaries.find((b) => b.name === "Aaliyah Putri")!;

  const afterResume = (run: () => void, fallbackMs: number) => {
    let left = false;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      sub.remove();
      run();
    };
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") left = true;
      else if (left) setTimeout(go, 900);
    });
    setTimeout(go, fallbackMs);
  };

  schedule([
    [0, () => router.replace({ pathname: "/unlock", params: { demoPin: "1" } })],
    [5600, () => store.toggleBalance()],
    [1600, () => store.toggleBalance()],
    [1800, () => router.push("/send")],
    ...keyTaps("99999_<<<<<_2500", 0),
    [900, () => router.push({ pathname: "/send-to", params: { amount: "2500", demoAccount: "0912345678", demoBank: "bca", demoQuery: "Aal", demoPick: who.name } })],
    [
      15200,
      () => {
        const tx = makeTransfer(router, who);
        afterResume(() => {
          router.replace({ pathname: "/transaction/[id]", params: { id: tx.id, receipt: "1" } });
          setTimeout(() => router.replace("/(tabs)/history"), 8000);
          setTimeout(() => router.replace({ pathname: "/(tabs)/wallet", params: { demoSwipe: "1" } }), 11800);
          setTimeout(() => router.replace("/(tabs)"), 16300);
        }, 20000);
      },
    ],
  ]);
}
