// Tenant accent colours must stay readable. An accent that cannot carry white text
// at WCAG AA contrast falls back to the product default (PORTAL-05).

export const DEFAULT_ACCENT = "#4B5FA8";
export const MIN_TEXT_CONTRAST = 4.5;

const HEX = /^#([0-9a-fA-F]{6})$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 0xff) + 0.7152 * channel((n >> 8) & 0xff) + 0.0722 * channel(n & 0xff);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function resolveAccent(candidate: string | null | undefined): { accent: string; usedFallback: boolean } {
  if (isHexColor(candidate) && contrastRatio(candidate, "#FFFFFF") >= MIN_TEXT_CONTRAST) {
    return { accent: candidate.toUpperCase(), usedFallback: false };
  }
  return { accent: DEFAULT_ACCENT, usedFallback: candidate != null };
}
