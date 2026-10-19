import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

/**
 * Figma "Progress Bar" component: 100×8, radius 100, track Text/Quaternary,
 * fill Brand/Secondary. `percent` is the variant value used on each frame.
 */
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    width: 100,
    height: 8,
    borderRadius: 100,
    backgroundColor: theme.palette.text.quaternary,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 100,
    backgroundColor: theme.colors.brandDark,
  },
}));
