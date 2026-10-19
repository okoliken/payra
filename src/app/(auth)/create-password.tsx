import { useState } from "react";
import { View } from "react-native";
import { useGuardedRouter } from "@/lib/navigation";
import { StyleSheet } from "react-native-unistyles";
import { AppText, Button, Header, Input, Screen } from "@/components/ui";

/**
 * Figma "Create New Password" (402×874): nav 64 (back only) → 24 → title block (gap 8) → 24 →
 * form gap 24: New Password, Confirm Password (both with the eye toggle) → Continue at y=760.
 * Subtitle copy is verbatim from the frame.
 */
export default function CreatePasswordScreen() {
  const router = useGuardedRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && confirm !== password;
  const valid = password.length >= 8 && confirm === password;

  return (
    <Screen scroll>
      <Header />
      <View style={styles.titleBlock}>
        <AppText variant="h4" weight="semiBold">
          Create New Password
        </AppText>
        <AppText variant="body" tone="secondary">
          Sign in to your account
        </AppText>
      </View>

      <View style={styles.form}>
        <Input
          label="New Password"
          placeholder="Enter your new password"
          value={password}
          onChangeText={setPassword}
          secure
        />
        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirm}
          onChangeText={setConfirm}
          secure
          error={mismatch ? "Passwords do not match" : undefined}
        />
      </View>

      <View style={styles.spacer} />
      <Button
        title="Continue"
        disabled={!valid}
        onPress={() =>
          router.replace({
            pathname: "/success",
            params: {
              title: "Password Changed!",
              body: "Your password has been changed successfully",
              next: "/(auth)/sign-in",
            },
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  titleBlock: { gap: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  form: { gap: theme.spacing.xxl },
  spacer: { flex: 1, minHeight: theme.spacing.xxl },
}));
