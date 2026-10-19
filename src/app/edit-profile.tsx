import { useState } from "react";
import { View } from "react-native";
import { useGuardedRouter } from "@/lib/navigation";
import { StyleSheet } from "react-native-unistyles";
import { Avatar, Button, Header, Input, Screen } from "@/components/ui";
import { useStore } from "@/store/app-store";

export default function EditProfileScreen() {
  const router = useGuardedRouter();
  const { user, updateUser } = useStore();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  return (
    <Screen scroll>
      <Header title="Edit Profile" />
      <View style={styles.avatar}>
        <Avatar name={name || user.name} size="lg" />
        <Button
          title="Change Photo"
          size="sm"
          fullWidth={false}
          onPress={() => {}}
        />
      </View>
      <Input
        label="Full Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        containerStyle={styles.field}
      />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        containerStyle={styles.field}
      />
      <View style={styles.spacer} />
      <Button
        title="Save"
        disabled={!name.trim() || !/\S+@\S+\.\S+/.test(email)}
        onPress={() => {
          updateUser({ name: name.trim(), email: email.trim() });
          router.back();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  avatar: {
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  field: { marginBottom: theme.spacing.lg },
  spacer: { flex: 1, minHeight: theme.spacing.xxl },
}));
