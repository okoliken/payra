import { useEffect, useState } from "react";
import { PinPad as KitPinPad } from "@okoli/ui";
import { usePayraKeys } from "@/components/keypad";
import { DEMO_HOOKS } from "@/lib/demo";

export const PIN_LENGTH = 6;

/**
 * @okoli/ui's PinPad (dots + keypad, shake on delete-when-empty) with the Figma key details.
 * Any PIN passes in the demo.
 */
export function PinPad({
  onComplete,
  compact = false,
  autoType = false,
}: {
  onComplete: (pin: string) => void;
  compact?: boolean;
  /** Dev-only (demo tour): types a PIN by itself. */
  autoType?: boolean;
}) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!DEMO_HOOKS || !autoType) return;
    const ts = "246810".split("").map((d, i) => setTimeout(() => setPin((p) => (p.length < PIN_LENGTH ? p + d : p)), 700 + i * 220));
    return () => ts.forEach(clearTimeout);
  }, [autoType]);

  return (
    <KitPinPad
      {...usePayraKeys()}
      length={PIN_LENGTH}
      compact={compact}
      value={pin}
      onChangeValue={setPin}
      onComplete={onComplete}
    />
  );
}
