export type CoverStyle =
  | "indie"
  | "vaporwave"
  | "minimal"
  | "brutalist"
  | "noir"
  | "punk"
  | "rock"
  | "pop"
  | "rnb"
  | "grunge";

export const COVER_STYLES: CoverStyle[] = [
  "indie",
  "vaporwave",
  "minimal",
  "brutalist",
  "noir",
  "punk",
  "rock",
  "pop",
  "rnb",
  "grunge",
];

export function randomStyle(): CoverStyle {
  return COVER_STYLES[Math.floor(Math.random() * COVER_STYLES.length)];
}

export function styleLabel(s: CoverStyle): string {
  if (s === "rnb") return "R&B";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
