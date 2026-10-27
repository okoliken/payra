# Payra

A portfolio demo of the **Payra e-wallet** Figma design, built with Expo and styled entirely with
[react-native-unistyles](https://www.unistyl.es) v3.

- **Expo SDK 57** · expo-router (file-based navigation) · TypeScript · React Compiler
- **Unistyles 3** for theming: every `StyleSheet.create((theme, rt) => …)` reacts to theme and
  safe-area changes on the native side. Light theme is 1:1 with the Figma style guide; dark theme is
  an added extra (toggle it in Profile → General Settings).
- Plus Jakarta Sans via `@expo-google-fonts`, icons from `lucide-react-native`.
- All data is mocked in `src/data/mock.ts`; app state is a Zustand store persisted to AsyncStorage
  (`src/store/app-store.ts`) — read it with selectors. Nothing touches a network.

## Run it

Shared components (Button, Sheet, Keypad, PinPad, SearchBar, PrivacyShield, Text, motion) come
from [@okoli/ui](https://github.com/okoliken/okoli-ui), linked from a sibling folder. Clone it next
to this repo first:

```bash
git clone https://github.com/okoliken/okoli-ui ../okoli-ui && (cd ../okoli-ui && npm install)
```

Unistyles ships native code, so **Expo Go won't work** — build a dev client once:

```bash
npm install
npm run ios        # expo run:ios (needs Xcode) – first run does prebuild + pod install
npm start          # later: Metro only, press i
```

Metro is pinned to port 8085 in `package.json` because 8081 is often taken on this machine.

## Structure

```
index.ts                 entry: expo-router/entry, then src/unistyles (must run before any StyleSheet)
src/unistyles.ts         StyleSheet.configure – themes + breakpoints + TS augmentation
src/theme/tokens.ts      colours, type scale, spacing, radius lifted from Figma
src/components/ui/       AppText, Button, Input, Card, Screen, Header, ListRow, Segmented, …
src/components/          tab-bar (floating pill), bank-card, transaction-row, amount-entry
src/app/                 routes
  index.tsx              launch → onboarding / sign-in / tabs
  onboarding.tsx
  (auth)/                getting-started → verify → personal-info → pin, sign-in, forgot-password
  (tabs)/                home, wallet, history, profile
  transfer, select-contact, send-amount, request, request-amount, top-up
  bills/[type]           electricity (prepaid/bills/services), water, internet, more
  notifications, points, promo, add-wallet, edit-profile, account-security, settings, success
```

## Flows to click through

1. Onboarding → Getting Started (phone) → OTP → Personal Info → PIN (any 6 digits) → Home.
2. Home → Transfer → pick a contact → keypad → Success (balance + history update).
3. Home → Electricity → Prepaid → choose a token → Buy.
4. Profile → General Settings → Dark Theme switch.
