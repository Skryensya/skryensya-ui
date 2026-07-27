export const rampRecipe = {
  chromaticLight: { 50: 90, 100: 82, 200: 68, 300: 52, 400: 32, 500: 22 },
  chromaticDark: { 700: 17, 800: 28, 900: 44, 950: 60 },
  neutral: {
    50: [1.6, 5],
    100: [4, 7],
    200: [8.6, 9],
    300: [14.8, 10],
    400: [26, 11],
    500: [41.2, 12],
    600: [53.5, 11],
    700: [59.6, 10],
    800: [68, 8],
    900: [75.8, 7],
    950: [83.4, 6],
  },
} as const;

export const defaultRampColors = {
  accent: "oklch(50.4% 0.169 259.6)",
  neutral: "oklch(58.8% 0.018 260)",
  danger: "oklch(56% 0.208 27)",
  success: "oklch(55.8% 0.16 150)",
  warning: "oklch(64% 0.132 75)",
  info: "oklch(56% 0.12 233)",
} as const;

export type RampRole = keyof typeof defaultRampColors;

/** Oklab triple. The recipe only ever mixes opaque colors, so alpha stays out of it. */
type Oklab = readonly [number, number, number];

const BLACK: Oklab = [0, 0, 0];
const WHITE: Oklab = [1, 0, 0];

/** Parses the only syntax the recipe accepts: `oklch(L% C H)`, with an optional `deg` on the hue. */
function toOklab(color: string): Oklab {
  const match = color
    .trim()
    .match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.-]+)(?:deg)?\s*\)$/i);
  if (!match) throw new Error(`createRamp expects an oklch() color, received "${color}"`);
  const [, l, c, h] = match;
  const radians = (Number(h) * Math.PI) / 180;
  const chroma = Number(c);
  return [Number(l) / 100, chroma * Math.cos(radians), chroma * Math.sin(radians)];
}

function round(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

function toOklch([l, a, b]: Oklab): string {
  const chroma = Math.hypot(a, b);
  if (round(chroma, 4) === 0) return `oklch(${round(l * 100, 2)}% 0 0)`;
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  return `oklch(${round(l * 100, 2)}% ${round(chroma, 4)} ${round((hue + 360) % 360, 2)})`;
}

/** `color-mix(in oklab, first weight%, second)` resolved at build time. */
function mix(first: Oklab, weight: number, second: Oklab): Oklab {
  const w = weight / 100;
  return [
    first[0] * w + second[0] * (1 - w),
    first[1] * w + second[1] * (1 - w),
    first[2] * w + second[2] * (1 - w),
  ];
}

export function createRamp(role: RampRole, color: string): Record<string, string> {
  const declarations: Record<string, string> = {};
  const base = toOklab(color);

  if (role === "neutral") {
    declarations["--ramp-neutral-0"] = "oklch(100% 0 0)";
    for (const [stop, [black, tone]] of Object.entries(rampRecipe.neutral)) {
      const grey = mix(BLACK, black, WHITE);
      declarations[`--ramp-neutral-${stop}`] = toOklch(mix(grey, 100 - tone, base));
    }
    declarations["--ramp-neutral-1000"] = "oklch(0% 0 0)";
    return declarations;
  }

  for (const [stop, weight] of Object.entries(rampRecipe.chromaticLight)) {
    declarations[`--ramp-${role}-${stop}`] = toOklch(mix(base, 100 - weight, WHITE));
  }
  declarations[`--ramp-${role}-600`] = color;
  for (const [stop, weight] of Object.entries(rampRecipe.chromaticDark)) {
    declarations[`--ramp-${role}-${stop}`] = toOklch(mix(base, 100 - weight, BLACK));
  }
  return declarations;
}
