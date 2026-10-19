# Figma → app map

Source: **Payra - E-Wallet Mobile App** (Main Page). Frames are 402×874. There are no prototype
links in the file, so the flow below follows section order and frame names. "Route" is the
expo-router path in `src/app`; ❌ = not built yet, ⚠️ = built but not yet verified layer-by-layer.

## 1 · Onboarding Experience
| Figma frame | Route | Status |
|---|---|---|
| Launch Screen | `/` | ⚠️ |
| Onboarding - 1 / 2 / 3 | `/onboarding` | ✅ verified (Figma PNG art) |

## 2 · Authentication Flow
| Figma frame | Route | Status |
|---|---|---|
| Getting Started | `/(auth)/getting-started` | ✅ verified (icons pending export) |
| Pick Country Code | `/country-code` (modal) | ⚠️ |
| Verification Code | `/(auth)/verify` | ✅ verified (30%) |
| Personal Information | `/(auth)/personal-info` | ✅ verified (45%) |
| Home Address | `/(auth)/home-address` | ✅ verified (60%) |
| Almost There! | `/(auth)/almost-there` | ✅ verified (75%, `pen` icon pending SVG) |
| Sign In | `/(auth)/sign-in` | ✅ verified (`eye`, `check` icons pending SVG) |

Intended order: Getting Started → (Pick Country Code) → Verification Code → Personal Information → Home Address → Almost There! → app. Sign In is the returning-user entry.

## 3 · Account Security & Recovery
| Figma frame | Route | Status |
|---|---|---|
| Sign In - Forgot Password (sheet over Sign In) | `/(auth)/sign-in` + `BottomSheet` | ✅ built (question-mark illustration pending PNG) |
| Forgot Password / Forgot PIN (choose SMS / email) | `/(auth)/forgot-password?kind=` | ⚠️ layout from capture, paddings unmeasured |
| Forgot Password / Verification Code (×2 states) | `/(auth)/verify?flow=reset&kind=` | ✅ same screen as Verification Code |
| Create New Password | `/(auth)/create-password` | ✅ built from frame |
| Password Changed! / PIN Changed! | `/success?title=&body=&next=` | ✅ layout built (illustration pending PNG) |
| Enter PIN (×4 states: empty, filled, error, overlay) | `/(auth)/pin` | ⚠️ |
| Forgot Password (×2) | — | ❌ (second variant) |

## 4 · Main
| Figma frame | Route | Status |
|---|---|---|
| Home | `/(tabs)` | ⚠️ |
| Notification (×3: list, highlighted, swipe-delete) | `/notifications` | ⚠️ |
| Notification - Deleted (empty) | `/notifications` | ⚠️ |
| Promo - All / Savings / Online Deals | `/promo` | ⚠️ |
| Points - Earned / Redeemed | `/points` | ⚠️ |

## 5 · Payment & Transfer
| Figma frame | Route | Status |
|---|---|---|
| Top Up | `/top-up` | ⚠️ |
| Request | `/request` | ⚠️ |
| Request / New Request (Select Contact) | `/select-contact` | ⚠️ |
| Request (Transfer) | `/transfer` | ⚠️ |
| Scan QRIS - Idle / Scanning / Completed | `/scan` | ✅ measured; line animates Idle→Scanning→Completed then /success (no prototype link in Figma); icons + QRIS logo are stand-ins |
| Top Up - Prepaid / Bills / Services (Electricity) | `/bills/electricity` | ⚠️ |

## 6 · Bills & Utilities
| Water · Internet · More | `/bills/water` · `/bills/internet` · `/bills/more` | ⚠️ |

## 7 · Wallet
| My Wallet | `/(tabs)/wallet` | ✅ verified (icons `add`, `settings`, `eye`, `lock`, `card`, `history`, `alt-arrow-right` + Visa/Mastercard marks pending SVG; heading gap 32 unmeasured) |
| My Wallet / Add New Wallet | `/add-wallet` | ⚠️ |

## 8 · History
| History | `/(tabs)/history` | ✅ verified (icons `search`, `arrow-left-down`, `arrow-right-up`, `card` pending SVG; group spacing 24 unmeasured) |

## 9 · Profile
| Figma frame | Route | Status |
|---|---|---|
| Profile | `/(tabs)/profile` | ⚠️ |
| Profile / Edit Profile | `/edit-profile` | ⚠️ |
| Profile / My QR | `/my-qr` | ❌ |
| Profile / Account Security | `/account-security` | ⚠️ |
| Profile / Notification (toggles) | `/notification-settings` | ❌ |
| Profile / General Settings | `/settings` | ⚠️ |
| Profile / General Settings / Change Language | `/settings/language` | ❌ |
| Profile / General Settings / Change Theme | `/settings/theme` | ❌ |

## Components (Components & Style Guide page)
- **Navigation Bar** (bottom): on Home at (48, 776) → bottom edge on the home-indicator line; pill h64, padding 8, gap 16, r100, Brand/Secondary. Active tab: h48, padding 12, gap 10, r100, Brand/Primary, icon 24 (`*-bold`) + Body SemiBold label. Inactive: 48×48 circle, #FAFAFA 10%, icon 24 (line) white.
- **Nav Bar** (top): h64, back = Secondary icon button 48 (B1 fill, 6% stroke), centred title, right action Icon Button or Link.
- **Buttons**: Primary (Brand/Primary, r24, h48, pad 12/14, gap 4), Secondary (B1 fill, 6% stroke), sizes Normal / Small; Icon Left / Right / Only.
- **Input**: label Body SemiBold 14 → 8 → field h48, r12, B2 fill, 6% stroke outside, pad 16/12, gap 12.
- **Progress Bar**: 100×8, r100, track Text/Quaternary, fill Brand/Secondary (15% on Getting Started).
- **Tabs Bars**: underline tabs (2/3/4) — Points, Promo.
- **Icons**: Solar icon set (`home`, `home-bold`, `card`, `notes`, `user`, `bell-bing`, `alt-arrow-down`, …) — exported as PNG into `assets/icons/` (pending).
- **Brands**: Google, Apple, Facebook, X, TikTok, Instagram. **Flag**: circular 18px flags.
