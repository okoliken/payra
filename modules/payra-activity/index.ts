import { requireOptionalNativeModule } from "expo-modules-core";

type Native = {
  start(direction: string, amount: string, counterparty: string, detail: string, seconds: number): boolean;
  endDelivered(): Promise<void>;
};

// Optional so a build without the native module (Android, an older dev client) just skips it.
const native = requireOptionalNativeModule<Native>("PayraActivity");

/** Show a payment in the Dynamic Island / lock screen; the ring fills over `seconds`. */
export function startPaymentActivity(p: {
  direction: "outgoing" | "incoming";
  amount: string;
  counterparty: string;
  detail: string;
  seconds: number;
}) {
  return native?.start(p.direction, p.amount, p.counterparty, p.detail, p.seconds) ?? false;
}

/** Clear payments that have already been delivered. */
export function endDeliveredActivities() {
  return native?.endDelivered() ?? Promise.resolve();
}
