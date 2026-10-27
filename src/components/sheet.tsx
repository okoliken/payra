import { Sheet as KitSheet, type SheetProps } from "@okoli/ui";
import { PrivacyShield } from "@/components/privacy-shield";

/** @okoli/ui's bottom sheet. Its Modal is a separate window, so it carries its own privacy cover. */
export function Sheet(props: Omit<SheetProps, "overlay">) {
  return <KitSheet {...props} overlay={<PrivacyShield />} />;
}
