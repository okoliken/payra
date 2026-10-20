import { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, { FadeOut } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText, Button, Screen } from "@/components/ui";
import { PayraLoader } from "@/components/payra-loader";
import { SuccessMark } from "@/components/brand-marks";
import { useGuardedRouter } from "@/lib/navigation";
import { fade, rise } from "@/lib/motion";

/** How long the (simulated) request takes, so the processing state is actually seen. */
const PROCESSING_MS = 1600;

/**
 * Transfer / top-up result. It opens on a processing state (just the animated Payra mark, the way
 * banking apps hold the screen while a payment goes through), then cross-fades to the result: our
 * SuccessMark 32 above an H4 title and Body copy (Figma "Password Changed!" layout), Primary "OK"
 * 32 above the home indicator.
 */
export default function SuccessScreen() {
  const router = useGuardedRouter();
  const { id, title, body } = useLocalSearchParams<{ id?: string; kind?: "topup" | "transfer"; title: string; body: string }>();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, PROCESSING_MS);
    return () => clearTimeout(t);
  }, []);

  if (!done) {
    return (
      <Screen>
        <Animated.View exiting={FadeOut.duration(150)} style={styles.fill}>
          <PayraLoader />
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.center}>
        <SuccessMark width={140} />
        <Animated.View entering={rise(120)} style={styles.copy}>
          <AppText variant="h4" weight="semiBold" align="center">
            {title}
          </AppText>
          <AppText variant="body" tone="secondary" align="center">
            {body}
          </AppText>
        </Animated.View>
      </View>
      <Animated.View entering={fade(220)} style={styles.cta}>
        {id ? (
          <Button
            title="View Details"
            variant="outline"
            onPress={() => router.replace({ pathname: "/transaction/[id]", params: { id } })}
          />
        ) : null}
        <Button title="OK" onPress={() => router.dismissTo("/(tabs)")} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 32 },
  cta: { gap: 12, marginBottom: 16 },
  copy: { gap: 8, alignSelf: "stretch" },
});
