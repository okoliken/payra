import { Tabs } from "expo-router";
import { useUnistyles } from "react-native-unistyles";
import { TabBar } from "@/components/tab-bar";
import { TabScene } from "@/components/tab-scene";

export default function TabsLayout() {
  const { theme } = useUnistyles();
  return (
    // All four tabs mount up front (lazy: false). The navigator's own transition is off and
    // each scene cross-fades itself on focus (see TabScene) — the built-in fade could leave a
    // tab at opacity 0 until the next navigation.
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenLayout={({ children, route, navigation }) => {
        const { index, routes } = navigation.getState();
        return <TabScene selected={routes[index]?.key === route.key}>{children}</TabScene>;
      }}
      screenOptions={{
        headerShown: false,
        lazy: false,
        animation: "none",
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
