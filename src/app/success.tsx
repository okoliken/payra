import { useEffect } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, { Easing, FadeInDown, ZoomIn } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText, Button, Screen } from "@/components/ui";
import { useGuardedRouter } from "@/lib/navigation";

const EASE = Easing.out(Easing.cubic);

/**
 * Figma "Password Changed!" (348:1931) layout and illustration, reused for the transfer result:
 * 310×200 art, 32 above an H4 title and Body copy, Primary "OK" 32 above the home indicator.
 * The art springs in, then the copy rises after it.
 */
export default function SuccessScreen() {
  const router = useGuardedRouter();
  const { amount, name } = useLocalSearchParams<{ amount: string; name: string }>();

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  return (
    <Screen>
      <View style={styles.center}>
        <Animated.Image
          entering={ZoomIn.springify().damping(13).stiffness(140).delay(80)}
          source={require("@/../assets/images/success-art.png")}
          style={styles.art}
        />
        <Animated.View entering={FadeInDown.delay(280).duration(420).easing(EASE)} style={styles.copy}>
          <AppText variant="h4" weight="semiBold" align="center">
            Transfer Successful!
          </AppText>
          <AppText variant="body" tone="secondary" align="center">
            You sent ${amount} to {name}
          </AppText>
        </Animated.View>
      </View>
      <Animated.View entering={FadeInDown.delay(420).duration(420).easing(EASE)} style={styles.cta}>
        <Button title="OK" onPress={() => router.dismissTo("/(tabs)")} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 32 },
  art: { width: 310, height: 200 },
  cta: { marginBottom: 16 },
  copy: { gap: 8, alignSelf: "stretch" },
});
