import { Keypad as KitKeypad, type KeypadProps } from "@okoli/ui";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppIcon } from "@/components/app-icon";

export type { KeypadKey } from "@okoli/ui";

/** The Figma "Enter PIN" key details: 114pt keys, the Solar backspace icon and black digits. */
export function usePayraKeys() {
  const { theme } = useUnistyles();
  return {
    keyWidth: 114,
    deleteIcon: <AppIcon name="backspace" size={28} color={theme.colors.text} />,
    digitStyle: styles.digit,
  };
}

/** @okoli/ui's Keypad with the Figma key details. */
export function Keypad(props: KeypadProps) {
  return <KitKeypad {...usePayraKeys()} {...props} />;
}

const styles = StyleSheet.create((theme) => ({
  digit: { color: theme.palette.black },
}));
