export type CoverStyle =
  | "indie"
  | "vaporwave"
  | "minimal"
  | "brutalist"
  | "noir"
  | "punk";

export const COVER_STYLES: CoverStyle[] = [
  "indie",
  "vaporwave",
  "minimal",
  "brutalist",
  "noir",
  "punk",
];

export function randomStyle(): CoverStyle {
  return COVER_STYLES[Math.floor(Math.random() * COVER_STYLES.length)];
}

export function styleLabel(s: CoverStyle): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
