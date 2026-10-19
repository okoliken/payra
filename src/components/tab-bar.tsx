import { useEffect } from "react";
import { Pressable, View } from "react-native";
import type { ComponentProps } from "react";
import type { Tabs } from "expo-router";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components/ui";
import { AppIcon, type IconName } from "@/components/app-icon";

type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

/** Figma "Navigation Bar" (4 tabs): Solar icons — line when inactive, bold when active. */
const tabs: Record<
  string,
  { label: string; icon: IconName; activeIcon: IconName; width: number }
> = {
  index: { label: "Home", icon: "home", activeIcon: "home-bold", width: 99 },
  wallet: {
    label: "Wallet",
    icon: "wallet-money",
    activeIcon: "wallet-money-bold",
    width: 104,
  },
  history: {
    label: "History",
    icon: "notes",
    activeIcon: "notes-bold",
    width: 106,
  },
  profile: {
    label: "Profile",
    icon: "user",
    activeIcon: "user-bold",
    width: 101,
  },
};

const TIMING = { duration: 280, easing: Easing.bezier(0.2, 0.8, 0.2, 1) };

/**
 * Figma "Navigation Bar" component, 4-tab variant:
 *  pill 64 tall, padding 8, gap 16, radius 100, fill Brand/Secondary;
 *  active "Tab Bar" 48 tall, padding 12, gap 10, radius 100, fill Brand/Primary, icon 24 + Body SemiBold label;
 *  inactive "Tab Bar" 48×48 circle, fill #FAFAFA at 10%, icon 24 in white.
 * The active chip grows from the 48pt circle to its labelled width while its colour and the
 * label fade in, all on the UI thread.
 */
export function TabBar({ state, navigation }: TabBarProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.pill}>
        {state.routes.map((route, i) => (
          <TabItem
            key={route.key}
            name={route.name}
            active={state.index === i}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (state.index !== i && !event.defaultPrevented)
                navigation.navigate(route.name);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function TabItem({
  name,
  active,
  onPress,
}: {
  name: string;
  active: boolean;
  onPress: () => void;
}) {
  const { theme } = useUnistyles();
  const tab = tabs[name] ?? {
    label: name,
    icon: "home" as const,
    activeIcon: "home-bold" as const,
    width: 99,
  };
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, TIMING);
  }, [active, progress]);

  const inactiveFill = "rgba(250, 250, 250, 0.10)";
  const chip = useAnimatedStyle(() => ({
    width: 48 + (tab.width - 48) * progress.value,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [inactiveFill, theme.colors.brand],
    ),
  }));
  const label = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * -6 }],
  }));
  // Cross-fade the two icon weights instead of swapping them abruptly.
  const lineIcon = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const boldIcon = useAnimatedStyle(() => ({ opacity: progress.value }));
  const pressed = useSharedValue(0);
  const press = useDerivedValue(() => 1 - pressed.value * 0.06);
  const scale = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  return (
    <Animated.View style={scale}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        onPressIn={() => (pressed.value = withTiming(1, { duration: 90 }))}
        onPressOut={() => (pressed.value = withTiming(0, { duration: 160 }))}
        onPress={onPress}
      >
        <Animated.View style={[styles.item, chip]}>
          <View style={styles.iconStack}>
            <Animated.View style={[styles.iconLayer, lineIcon]}>
              <AppIcon
                name={tab.icon}
                size={24}
                color={theme.palette.background.b1}
              />
            </Animated.View>
            <Animated.View style={[styles.iconLayer, boldIcon]}>
              <AppIcon
                name={tab.activeIcon}
                size={24}
                color={theme.colors.brandDark}
              />
            </Animated.View>
          </View>
          <Animated.View style={[styles.label, label]} pointerEvents="none">
            <AppText
              variant="body"
              weight="semiBold"
              tone="onBrand"
              numberOfLines={1}
            >
              {tab.label}
            </AppText>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  // Figma Home frame: Navigation Bar at (48, 776), 307×64 → its bottom edge sits exactly on the safe-area line.
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: rt.insets.bottom,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.lg,
    padding: theme.spacing.sm,
    height: 64,
    borderRadius: 100,
    backgroundColor: theme.colors.brandDark,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 100,
    overflow: "hidden",
  },
  iconStack: { width: 24, height: 24 },
  iconLayer: { position: "absolute", top: 0, left: 0 },
  label: { marginLeft: 10 },
}));
