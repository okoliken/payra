import { useEffect, useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { AppText, Header, IconCircle, Screen } from "@/components/ui";
import { AppIcon } from "@/components/app-icon";
import { useGuardedRouter } from "@/lib/navigation";
import { contacts, type Contact } from "@/data/mock";

const EASE = Easing.out(Easing.cubic);

/** Figma "Request / New Request" (535:6326), titled Select Contact. */
export default function SelectContactScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const [query, setQuery] = useState("");
  // Rows cascade in on the first render only; later renders come from typing in search.
  const [cascade, setCascade] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setCascade(false), 600);
    return () => clearTimeout(t);
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return contacts.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || (digits && c.phone.replace(/\D/g, "").includes(digits)),
    );
  }, [query]);

  const pick = (c: Contact) => router.push({ pathname: "/send-amount", params: { contactId: c.id } });

  return (
    <Screen>
      <Header title="Select Contact" />
      <View style={styles.searchRow}>
        <View style={styles.field}>
          <AppIcon name="search" size={18} color={theme.colors.text} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Type a name or phone number"
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            autoCorrect={false}
          />
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <AppText variant="body" weight="semiBold" tone="danger">
            Cancel
          </AppText>
        </Pressable>
      </View>

      <AppText variant="bodyL" weight="semiBold" style={styles.title}>
        My Contacts
      </AppText>
      <Animated.ScrollView
        style={styles.card}
        contentContainerStyle={styles.cardContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {list.map((c, i) => (
          <Animated.View
            key={c.id}
            entering={
              cascade
                ? FadeInDown.delay(60 + i * 35).duration(380).easing(EASE)
                : FadeIn.duration(200)
            }
            exiting={FadeOut.duration(150)}
            layout={LinearTransition.duration(260).easing(EASE)}
          >
            {i > 0 ? <View style={styles.divider} /> : null}
            <Pressable onPress={() => pick(c)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <IconCircle>
                <AppText variant="captionL" weight="semiBold" style={styles.black}>
                  {c.name[0]}
                </AppText>
              </IconCircle>
              <View style={styles.gap6}>
                <AppText variant="body" weight="semiBold">
                  {c.name}
                </AppText>
                <View style={styles.phone}>
                  <View style={styles.code}>
                    <AppIcon name="add" size={12} color={theme.colors.textSecondary} />
                    <AppText variant="captionL" tone="secondary">
                      {c.phone.split(" ")[0]!.replace("+", "")}
                    </AppText>
                  </View>
                  <AppText variant="captionL" tone="secondary">
                    {c.phone.split(" ").slice(1).join(" ")}
                  </AppText>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </Animated.ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  searchRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  // Figma Search Bar / Focused: 48 tall, Background/B1, 6% stroke, r12, padding 12/16, gap 12.
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.stroke.soft,
    backgroundColor: theme.colors.surfaceRaised,
  },
  input: {
    flex: 1,
    alignSelf: "stretch",
    padding: 0,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    ...theme.typography.body,
  },
  title: { marginTop: 24, marginBottom: 16 },
  card: { flex: 1, borderRadius: 18, backgroundColor: theme.colors.surfaceRaised },
  cardContent: { padding: 18 },
  divider: { height: 1, marginVertical: 12, backgroundColor: theme.colors.stroke.soft },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  pressed: { opacity: 0.6 },
  black: { color: theme.palette.black },
  gap6: { gap: 6 },
  phone: { flexDirection: "row", gap: 6 },
  code: { flexDirection: "row", alignItems: "center", gap: 2 },
}));
