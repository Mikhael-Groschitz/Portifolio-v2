const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const RGB_COLOR = /^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*1)?\)$/;

export function isHexColor(value: string): boolean {
  return HEX_COLOR.test(value);
}

export function hexFromRgb(value: string): string | null {
  const channels = RGB_COLOR.exec(value.trim())?.slice(1).map(Number);
  if (!channels || channels.some((channel) => channel > 255)) {
    return null;
  }
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function channelToLinear(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  if (!isHexColor(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const [r, g, b] = [1, 3, 5].map((start) =>
    channelToLinear(parseInt(hex.slice(start, start + 2), 16)),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

export type Ink = "dark" | "light";

export function readableInk(background: string): Ink {
  return contrastRatio(background, "#000000") >=
    contrastRatio(background, "#ffffff")
    ? "dark"
    : "light";
}
