import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  History,
  Lock,
  Mail,
  Pencil,
  Plus,
  Search,
  Settings,
  Smartphone,
  Zap,
  ImagePlus,
  BadgeCheck,
  QrCode,
  Nfc,
} from "lucide-react-native";
import { SvgXml } from "react-native-svg";
import * as Solar from "@/components/icons/solar";
import { figmaIcons, type FigmaIconName } from "@/components/icons/figma-icons";
import type { IconProps } from "@/components/icons/solar";

/**
 * Icon registry keyed by the Figma component name (Solar icon set).
 * Add an icon by pasting its SVG from Figma into `icons/solar.tsx` and mapping it here.
 */
const registry = {
  home: Solar.Home,
  "wallet-money": Solar.WalletMoney,
  notes: Solar.Notes,
  user: Solar.User,
  "home-bold": Solar.HomeBold,
  "wallet-money-bold": Solar.WalletMoneyBold,
  "notes-bold": Solar.NotesBold,
  "user-bold": Solar.UserBold,
  bell: Solar.Bell,
  sale: Solar.Sale,
  scanner: Solar.Scanner,
  coin: Solar.Coin,
  // TODO(figma-assets): temporary until the Figma "pen" SVG is pasted in.
  pen: (p: IconProps) => (
    <Pencil size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  eye: (p: IconProps) => (
    <Eye size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  "eye-closed": (p: IconProps) => (
    <EyeOff size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  check: (p: IconProps) => (
    <Check size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  smartphone: (p: IconProps) => (
    <Smartphone size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  letter: (p: IconProps) => (
    <Mail size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  search: (p: IconProps) => (
    <Search size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  "arrow-left-down": (p: IconProps) => (
    <ArrowDownLeft size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  "arrow-right-up": (p: IconProps) => (
    <ArrowUpRight size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  card: (p: IconProps) => (
    <CreditCard size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  add: (p: IconProps) => (
    <Plus size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  "alt-arrow-right": (p: IconProps) => (
    <ChevronRight size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  settings: (p: IconProps) => (
    <Settings size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  lock: (p: IconProps) => (
    <Lock size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  history: (p: IconProps) => (
    <History size={p.size} color={p.color} strokeWidth={1.5} />
  ),
  flash: (p: IconProps) => <Zap size={p.size} color={p.color} strokeWidth={1.5} />,
  "gallery-add-bold": (p: IconProps) => <ImagePlus size={p.size} color={p.color} strokeWidth={1.5} />,
  verified: (p: IconProps) => <BadgeCheck size={p.size} color={p.color} strokeWidth={1.5} />,
  "qr-code": (p: IconProps) => <QrCode size={p.size} color={p.color} strokeWidth={1.5} />,
  nfc: (p: IconProps) => <Nfc size={p.size} color={p.color} strokeWidth={1.5} />,
} satisfies Record<string, (p: IconProps) => React.JSX.Element>;

export type IconName = keyof typeof registry | FigmaIconName;

export function AppIcon({
  name,
  size = 24,
  color,
}: {
  name: IconName;
  size?: number;
  color: string;
}) {
  if (name in figmaIcons) {
    return <SvgXml xml={figmaIcons[name as FigmaIconName]} width={size} height={size} color={color} />;
  }
  const Icon = registry[name as keyof typeof registry];
  return <Icon size={size} color={color} />;
}
