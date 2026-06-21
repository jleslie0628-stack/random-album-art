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

export type TitlePos =
  | "tl" | "tc" | "tr"
  | "ml" | "mc" | "mr"
  | "bl" | "bc" | "br";

// Positions that are safe for the title per style — excludes the row occupied
// by that style's subtitle so the two never overlap.
const TITLE_POSITIONS: Record<CoverStyle, TitlePos[]> = {
  indie:     ["tl", "tc", "tr", "ml", "mc", "mr"],
  vaporwave: ["tl", "tc", "tr", "bl", "bc", "br"],
  minimal:   ["ml", "mc", "mr", "bl", "bc", "br"],
  brutalist: ["ml", "mc", "mr", "bl", "bc", "br"],
  noir:      ["tl", "tc", "tr", "bl", "bc", "br"],
  rock:      ["ml", "mc", "mr", "bl", "bc", "br"],
  pop:       ["tl", "tc", "tr", "bl", "bc", "br"],
  rnb:       ["tl", "tc", "tr", "bl", "bc", "br"],
  grunge:    ["ml", "mc", "mr", "bl", "bc", "br"],
  punk:      ["tl", "tc", "tr", "ml", "mc", "mr"],
};

export function randomTitlePos(style: CoverStyle): TitlePos {
  const opts = TITLE_POSITIONS[style];
  return opts[Math.floor(Math.random() * opts.length)];
}

export function titlePosClasses(pos: TitlePos): string {
  switch (pos) {
    case "tl": return "top-5 left-5 text-left";
    case "tc": return "top-5 left-1/2 -translate-x-1/2 text-center";
    case "tr": return "top-5 right-5 text-right";
    case "ml": return "top-1/2 -translate-y-1/2 left-5 text-left";
    case "mc": return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center";
    case "mr": return "top-1/2 -translate-y-1/2 right-5 text-right";
    case "bl": return "bottom-5 left-5 text-left";
    case "bc": return "bottom-5 left-1/2 -translate-x-1/2 text-center";
    case "br": return "bottom-5 right-5 text-right";
  }
}

