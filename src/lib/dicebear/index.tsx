/**
 * DiceBear avatars for React Native, as a drop-in module.
 *
 * Self-contained on purpose so it can be copied into another project: it only depends on
 * `@dicebear/core`, a DiceBear style JSON, `react`, and `react-native-svg`.
 *
 *   import { configureAvatars, useDiceBearAvatar, DiceBearAvatar } from "@/lib/dicebear";
 *   import notionists from "@dicebear/styles/notionists.json";
 *
 *   configureAvatars({ style: notionists, options: { backgroundColor: "#ECF0AF" } });
 *   <DiceBearAvatar seed="Aaliyah Putri" size={40} />
 *
 * `useDiceBearAvatar(seed, options)` returns the SVG markup and a data URI for the same seed,
 * for anything that is not an `<SvgXml>` (an `<Image>`, a share sheet, a cache on disk).
 * Rendering is deterministic per seed + options and memoised in a small LRU so lists of
 * avatars stay cheap to scroll.
 */
import { useMemo } from "react";
import { SvgXml, type SvgProps } from "react-native-svg";
import { Avatar, Style, type StyleOptions } from "@dicebear/core";

// `@dicebear/core` deep-clones with `structuredClone`, which Hermes does not provide.
// Everything it clones is plain JSON, so a JSON round-trip is an exact substitute.
if (typeof globalThis.structuredClone !== "function") {
  (globalThis as { structuredClone?: <T>(value: T) => T }).structuredClone = <T,>(value: T): T =>
    value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

/** A DiceBear style: the JSON from `@dicebear/styles/<name>.json`, or an already built `Style`. */
export type AvatarStyle = Style | object;

/** Any DiceBear option (`seed` and `size` are managed here, so they are left out). */
export type AvatarOptions = Omit<StyleOptions, "seed" | "size">;

export type AvatarConfig = {
  /** Style used when a call does not pass its own. */
  style?: AvatarStyle;
  /** Options merged under every call's options (colours, radius, probabilities…). */
  options?: AvatarOptions;
  /** How many rendered avatars to keep in memory. Default 256. */
  cacheSize?: number;
};

const styleCache = new WeakMap<object, Style>();
const svgCache = new Map<string, string>();
let config: Required<AvatarConfig> = { style: {}, options: {}, cacheSize: 256 };

/** Set project-wide defaults once, at startup. */
export function configureAvatars(next: AvatarConfig) {
  config = { ...config, ...next };
  svgCache.clear();
}

/** Builds (and reuses) the `Style` for a definition; `new Style()` validates its schema, which is slow. */
function resolveStyle(style: AvatarStyle): Style {
  if (style instanceof Style) return style;
  let built = styleCache.get(style);
  if (!built) {
    built = new Style(style);
    styleCache.set(style, built);
  }
  return built;
}

/** Stable key for the cache: sorted so `{a,b}` and `{b,a}` hit the same entry. */
const keyOf = (seed: string, options: AvatarOptions) =>
  `${seed}\u0000${JSON.stringify(options, Object.keys(options).sort())}`;

/** Render an avatar's SVG markup for a seed. Deterministic, cached. */
export function avatarSvg(seed: string, options: AvatarOptions = {}, style: AvatarStyle = config.style): string {
  const merged = { ...config.options, ...options };
  const key = keyOf(seed, merged) + (style === config.style ? "" : "\u0000custom");
  const hit = svgCache.get(key);
  if (hit) return hit;

  const svg = new Avatar(resolveStyle(style), { ...merged, seed }).toString();
  if (svgCache.size >= config.cacheSize) {
    // Map iterates in insertion order, so the first key is the oldest.
    const oldest = svgCache.keys().next().value;
    if (oldest !== undefined) svgCache.delete(oldest);
  }
  svgCache.set(key, svg);
  return svg;
}

/** The same avatar as a `data:image/svg+xml` URI, for `<Image>` or sharing. */
export const avatarUri = (seed: string, options?: AvatarOptions, style?: AvatarStyle) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg(seed, options, style))}`;

/**
 * Hook: the avatar for a seed, memoised across renders.
 * Pass `style` to use something other than the configured default.
 */
export function useDiceBearAvatar(seed: string, options: AvatarOptions = {}, style?: AvatarStyle) {
  const optionsKey = JSON.stringify(options, Object.keys(options).sort());
  return useMemo(
    () => {
      const svg = avatarSvg(seed, options, style);
      return { svg, uri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` };
    },
    // `optionsKey` stands in for `options`, so a fresh object literal each render does not re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, optionsKey, style],
  );
}

export type DiceBearAvatarProps = Omit<SvgProps, "width" | "height"> & {
  seed: string;
  /** Rendered width and height in points. */
  size?: number;
  options?: AvatarOptions;
  /** A DiceBear style other than the configured default (`style` is the view style, as on any SVG). */
  avatarStyle?: AvatarStyle;
};

/** The avatar as a view, sized to `size`. */
export function DiceBearAvatar({ seed, size = 40, options, avatarStyle, ...rest }: DiceBearAvatarProps) {
  const { svg } = useDiceBearAvatar(seed, options, avatarStyle);
  return <SvgXml xml={svg} width={size} height={size} {...rest} />;
}
