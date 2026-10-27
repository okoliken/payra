import { Image, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { IconCircle } from "@/components/ui";
import { DiceBearAvatar } from "@/lib/dicebear";
import { banks } from "@/data/mock";
import "@/lib/avatars";

type Size = "lg" | "md" | "sm";
const DISC: Record<Size, number> = { lg: 40, md: 32, sm: 28 };

/**
 * A person in the Figma double circle: their DiceBear portrait (seeded by name, so it is the
 * same everywhere) inside the disc, plus a small bank badge when the account is at a bank.
 */
export function PersonAvatar({ name, provider, size = "lg" }: { name: string; provider?: string; size?: Size }) {
  const logo = provider ? banks.find((b) => b.name === provider)?.logo : undefined;
  return (
    <View>
      <IconCircle size={size}>
        <DiceBearAvatar seed={name} size={DISC[size]} accessibilityLabel={name} />
      </IconCircle>
      {logo ? <Image source={logo} style={styles.badge} /> : null}
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  badge: { position: "absolute", right: -2, bottom: -2, width: 20, height: 20 },
}));
