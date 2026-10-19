import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { useGuardedRouter } from "@/lib/navigation";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Search, X } from "lucide-react-native";
import { AppText, Card, Header, Input, Screen } from "@/components/ui";
import { countries } from "@/data/mock";
import { useStore } from "@/store/app-store";

export default function CountryCodeScreen() {
  const router = useGuardedRouter();
  const { theme } = useUnistyles();
  const { setCountry } = useStore();
  const [query, setQuery] = useState("");
  const data = useMemo(
    () =>
      countries.filter((c) =>
        c.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  return (
    <Screen>
      <Header title="Pick Your Country Code" />
      <View style={styles.searchRow}>
        <Input
          containerStyle={styles.search}
          placeholder="Search country"
          value={query}
          onChangeText={setQuery}
          autoFocus
          left={<Search size={18} color={theme.colors.textSecondary} />}
          right={
            query ? (
              <Pressable onPress={() => setQuery("")}>
                <X size={16} color={theme.colors.textSecondary} />
              </Pressable>
            ) : null
          }
        />
        <Pressable onPress={() => router.back()}>
          <AppText variant="body" weight="semiBold" tone="danger">
            Cancel
          </AppText>
        </Pressable>
      </View>
      <Card padded={false} style={styles.list}>
        <FlatList
          data={data}
          keyExtractor={(c) => c.code + c.name}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setCountry(item.code);
                router.back();
              }}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
            >
              <AppText variant="bodyL">{item.flag}</AppText>
              <AppText variant="body" weight="semiBold">
                {item.code}
              </AppText>
              <AppText variant="body" tone="secondary">
                {item.name}
              </AppText>
            </Pressable>
          )}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  search: { flex: 1 },
  list: { flex: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
  },
  rowPressed: { backgroundColor: theme.colors.brand },
  sep: {
    height: 1,
    backgroundColor: theme.colors.stroke.soft,
    marginHorizontal: theme.spacing.lg,
  },
}));
