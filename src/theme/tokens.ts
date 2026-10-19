/**
 * Design tokens lifted from the Payra Figma "Components & Style Guide" page.
 * Colors are hex, typography is Plus Jakarta Sans (size / line height in px).
 */

export const palette = {
  brand: { primary: "#ECF0AF", secondary: "#0B4647" },
  text: {
    primary: "#18181B",
    secondary: "#71717A",
    tertiary: "#A1A1AA",
    quaternary: "#D4D4D8",
  },
  gray: {
    primary: "#52525B",
    secondary: "#71717A",
    tertiary: "#A1A1AA",
    quaternary: "#D4D4D8",
  },
  // Verified from the Figma colour styles themselves (the style-guide swatch labels are shifted):
  // B0 - App (screen bg), B1 - Base (buttons/chips), B2 - Elevated (inputs), B3 - Subtle.
  background: { b0: "#F3F4F6", b1: "#FAFAFA", b2: "#F9FAFB", b3: "#EEF0F3" },
  green: {
    default: "#16A34A",
    hover: "#22C55E",
    active: "#15803D",
    stroke: "#BBF7D0",
    fill: "#F0FDF4",
  },
  yellow: {
    default: "#EAB308",
    hover: "#FACC15",
    active: "#CA8A04",
    stroke: "#FEF08A",
    fill: "#FEFCE8",
  },
  orange: {
    default: "#EA580C",
    hover: "#F97316",
    active: "#C2410C",
    stroke: "#FED7AA",
    fill: "#FFF7ED",
  },
  red: {
    default: "#DC2626",
    hover: "#EF4444",
    active: "#B91C1C",
    stroke: "#FECACA",
    fill: "#FEF2F2",
  },
  violet: {
    default: "#7C3AED",
    hover: "#8B5CF6",
    active: "#6D28D9",
    stroke: "#DDD6FE",
    fill: "#F5F3FF",
  },
  cyan: {
    default: "#38BDF8",
    hover: "#7DD3FC",
    active: "#0EA5E9",
    stroke: "#BAE6FD",
    fill: "#F0F9FF",
  },
  pink: {
    default: "#ED39A2",
    hover: "#F472B6",
    active: "#BE185D",
    stroke: "#FED5EE",
    fill: "#FEF1F9",
  },
  blue: {
    default: "#2563EB",
    hover: "#3B82F6",
    active: "#1D4ED8",
    stroke: "#BFDBFE",
    fill: "#EFF6FF",
  },
  white: "#FFFFFF",
  black: "#000000",
};

/** `#18181B` at the alpha levels the Figma "Fill" / "Stroke" groups use. */
const ink = (alpha: number) => `rgba(24, 24, 27, ${alpha})`;
const paper = (alpha: number) => `rgba(250, 250, 250, ${alpha})`;

export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
} as const;

export const typography = {
  display: { fontSize: 36, lineHeight: 44 },
  h1: { fontSize: 32, lineHeight: 40 },
  h2: { fontSize: 28, lineHeight: 36 },
  h3: { fontSize: 24, lineHeight: 32 },
  h4: { fontSize: 20, lineHeight: 28 },
  h5: { fontSize: 18, lineHeight: 26 },
  bodyL: { fontSize: 16, lineHeight: 24 },
  body: { fontSize: 14, lineHeight: 20 },
  captionL: { fontSize: 12, lineHeight: 17 },
  captionS: { fontSize: 10, lineHeight: 14 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxx: 42,
  xxxxl: 64,
  /** Horizontal page gutter used on every screen in the Figma file. */
  gutter: 16,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export type ThemeName = "light" | "dark";

export const lightTheme = {
  name: "light" as ThemeName,
  colors: {
    brand: palette.brand.primary,
    brandDark: palette.brand.secondary,
    onBrand: palette.brand.secondary,
    onBrandDark: palette.white,

    background: palette.background.b0,
    surface: palette.white,
    /** Figma Background/B1 - Base: buttons, chips, secondary surfaces. */
    surfaceRaised: palette.background.b1,
    /** Figma Background/B2 - Elevated: input fields. */
    field: palette.background.b2,
    surfaceAlt: palette.background.b2,
    surfaceMuted: palette.background.b3,

    text: palette.text.primary,
    textSecondary: palette.text.secondary,
    textTertiary: palette.text.tertiary,
    textQuaternary: palette.text.quaternary,

    fill: {
      strong: ink(0.16),
      medium: ink(0.08),
      soft: ink(0.04),
      faint: ink(0.02),
    },
    stroke: { strong: ink(0.12), soft: ink(0.06) },

    success: palette.green.default,
    successSoft: palette.green.fill,
    warning: palette.yellow.default,
    warningSoft: palette.yellow.fill,
    danger: palette.red.default,
    dangerSoft: palette.red.fill,
    info: palette.blue.default,
    infoSoft: palette.blue.fill,

    tabBar: palette.brand.secondary,
    tabBarActive: palette.brand.primary,
  },
  palette,
  fonts,
  typography,
  spacing,
  radius,
};

export const darkTheme: typeof lightTheme = {
  ...lightTheme,
  name: "dark",
  colors: {
    ...lightTheme.colors,
    onBrand: palette.brand.secondary,
    background: "#0A1516",
    surface: "#112224",
    surfaceRaised: "#152A2C",
    field: "#182F31",
    surfaceAlt: "#182F31",
    surfaceMuted: "#1E3A3C",

    text: "#FAFAFA",
    textSecondary: "#A1A1AA",
    textTertiary: "#71717A",
    textQuaternary: "#52525B",

    fill: {
      strong: paper(0.16),
      medium: paper(0.08),
      soft: paper(0.04),
      faint: paper(0.02),
    },
    stroke: { strong: paper(0.12), soft: paper(0.06) },

    tabBar: "#112224",
    tabBarActive: palette.brand.primary,
  },
};

export type AppTheme = typeof lightTheme;
