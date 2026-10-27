import { PrivacyShield as KitPrivacyShield } from "@okoli/ui";
import { Logo } from "@/components/ui";

/**
 * @okoli/ui's privacy screen with the Payra logo: blurs balances out of the app-switcher snapshot
 * under a light Brand/Secondary tint.
 */
export function PrivacyShield() {
  return (
    <KitPrivacyShield>
      <Logo size={56} />
    </KitPrivacyShield>
  );
}
