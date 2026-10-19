import { StyleSheet } from 'react-native-unistyles';
import { darkTheme, lightTheme } from './theme/tokens';

const themes = { light: lightTheme, dark: darkTheme };

const breakpoints = {
  xs: 0,
  sm: 360,
  md: 400,
  lg: 600,
} as const;

type AppThemes = typeof themes;
type AppBreakpoints = typeof breakpoints;

/* eslint-disable @typescript-eslint/no-empty-object-type -- Unistyles' documented augmentation pattern */
declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

StyleSheet.configure({
  themes,
  breakpoints,
  settings: {
    // Start light like the Figma file; the General Settings screen can flip it.
    initialTheme: 'light',
  },
});
