# Figma → app map

Source: **Payra - E-Wallet Mobile App** (Main Page), frames 402×874. The demo covers one flow,
sending money, plus the Wallet tab's card stack. Everything else in the file is out of scope.

| Step | Figma frame | Route |
|---|---|---|
| Launch | Launch Screen | `/` |
| Intro | Onboarding - 1 / 2 / 3 | `/onboarding` |
| Home | Home (784:3718) | `/(tabs)` |
| Pick how to send | Request (563:1388), titled Transfer | `/transfer` |
| Pick the person | Request / New Request (535:6326), titled Select Contact | `/select-contact` |
| Amount | **not in Figma**: built from the contact row, PIN keypad and Primary button | `/send-amount` |
| Authorise | Enter PIN (338:1352) | `/pin` |
| Done | Password Changed! (348:1931) layout and art, transfer copy | `/success` |
| Back on Home | balance counts down, the transfer slides into Recent Transaction | `/(tabs)` |
| Wallet | My Wallet (670:1841): swipeable card stack | `/(tabs)/wallet` |

History and Profile stay as tabs so the tab bar is complete; they are not part of the flow.

## Assets
Exported straight from the file with the Figma plugin API (no manual exports):
- Icons: every Solar icon used in these frames, as SVG → `src/components/icons/figma-icons.ts`
- Promo banners `assets/images/promo-1..3.png`, success art, contact avatars (@3x PNG)

## Not in the design (copy written for the demo)
- Amount screen: "Your Balance $…", "Continue"
- Success: "Transfer Successful!", "You sent $X to Name"
