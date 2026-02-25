export type PaletteColor = {
  hex: string;       // "A4C8EC" or "#A4C8EC"
  group: string;     // e.g. "My Helsinki"
  name?: string;     // optional
};

export const COLORS: PaletteColor[] = [
  // --- My Helsinki
  { hex: "#A4C8EC", group: "My Helsinki" },
  { hex: "#FEEB6C", group: "My Helsinki" },
  { hex: "#CFE4F5", group: "My Helsinki" },
  { hex: "#00D9B0", group: "My Helsinki" },
  { hex: "#F59EC3", group: "My Helsinki" },
  { hex: "#FFC61E", group: "My Helsinki" },
  { hex: "#009A4B", group: "My Helsinki" },

  // --- Navies
  { hex: "#05347E", group: "Navies" },
  { hex: "#094886", group: "Navies" },
  { hex: "#1E3653", group: "Navies" },
  { hex: "#2F5972", group: "Navies" },

  // --- iOS Colours (example)
  { hex: "#007AFF", group: "iOS Colours" },
  { hex: "#FF3B30", group: "iOS Colours" },
  { hex: "#E5E5EA", group: "iOS Colours" },

  // ...ここにPDFの残りをどんどん追加してOK
];
