export type PaletteColor = {
  hex: string;
  group: string;
  description?: string;     // optional
  isWhite?: boolean;
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
  { hex: "#E5E5EA", group: "iOS Colours", isWhite: true },

  // --- Tricoroll
  { hex: "#C1C8D1", group: "Tricoroll" },
  { hex: "#CE0000", group: "Tricoroll" },
  { hex: "#F8FBFC", group: "Tricoroll", isWhite: true },
  { hex: "#2A68B2", group: "Tricoroll" },

  // --- Swedish
  { hex: "#145DA0", group: "Swedish" },
  { hex: "#F7CD2D", group: "Swedish" },

  // --- Christmas wonderland
  { hex: "#027145", group: "Christmas wonderland" },
  { hex: "#039059", group: "Christmas wonderland" },
  { hex: "#DD2728", group: "Christmas wonderland" },
  { hex: "#FCD746", group: "Christmas wonderland" },
  { hex: "#2779DA", group: "Christmas wonderland" },
  { hex: "#296EBF", group: "Christmas wonderland" },

  // --- Cream and blue
  { hex: "#FEF9EF", group: "Cream and blue", isWhite: true },
  { hex: "#2480F2", group: "Cream and blue" },

  // --- Light blues
  { hex: "#4F89B7", group: "Light blues" },
  { hex: "#A4C8EC", group: "Light blues" },
  { hex: "#A5C3DE", group: "Light blues" },
  { hex: "#B5D7FF", group: "Light blues" },
  { hex: "#CFE4F5", group: "Light blues" },

  // --- Dusty blue and nice red
  { hex: "#4F89B7", group: "Dusty blue and nice red" },
  { hex: "#FEF9EF", group: "Dusty blue and nice red", isWhite: true },
  { hex: "#E10032", group: "Dusty blue and nice red" },

  // --- Social media
  { hex: "#2A68B2", group: "Social media" },
  { hex: "#CE0000", group: "Social media" },
  { hex: "#FCD746", group: "Social media" },
  { hex: "#A4C8EC", group: "Social media" },
  { hex: "#F2F2F2", group: "Social media", isWhite: true },

  // --- Baby Goods
  { hex: "#d2e8eb", group: "Baby Goods" },
  { hex: "#f3e4c6", group: "Baby Goods" },
  { hex: "#e8c99a", group: "Baby Goods" },
  { hex: "#f7d6d6", group: "Baby Goods" },
  { hex: "#e4a8aa", group: "Baby Goods" },
  { hex: "#d0d3d8", group: "Baby Goods" },

  // --- Mint green and gray
  { hex: "#d2e8eb", group: "Mint green and gray" },
  { hex: "#a4d1d7", group: "Mint green and gray" },
  { hex: "#b8dcd3", group: "Mint green and gray" },
  { hex: "#c7d8da", group: "Mint green and gray" },
  { hex: "#d0d3d8", group: "Mint green and gray" },

  // --- Icy blues
  { hex: "#c3ddfd", group: "Icy blues" },
  { hex: "#B2E0ED", group: "Icy blues" },
  { hex: "#CDE8F2", group: "Icy blues" },
  { hex: "#B0E0E6", group: "Icy blues" },
  { hex: "#e0f7fa", group: "Icy blues", isWhite: true },
  { hex: "#A3D5E0", group: "Icy blues" },
  { hex: "#B6D0E2", group: "Icy blues" },
  { hex: "#89CFF0", group: "Icy blues" },
  { hex: "#d6effc", group: "Icy blues" },
  { hex: "#cfe4f5", group: "Icy blues" },

  // --- Miffy
  { hex: "#f26522", group: "Miffy" },
  { hex: "#ffc80b", group: "Miffy" },
  { hex: "#00712a", group: "Miffy" },
  { hex: "#005599", group: "Miffy" },
  { hex: "#202221", group: "Miffy" },

  // --- Scandi table
  { hex: "#da4a3d", group: "Scandi table" },
  { hex: "#cfe4f5", group: "Scandi table" },
  { hex: "#f1f1f9", group: "Scandi table", isWhite: true },
  { hex: "#a4d1d7", group: "Scandi table" },
  { hex: "#a98470", group: "Scandi table" },
  { hex: "#607cac", group: "Scandi table" },
  { hex: "#6d6c70", group: "Scandi table" },

  // --- My accent colours
  { hex: "#5DA6A7", group: "My accent colours" },
  { hex: "#4A90E2", group: "My accent colours" },
  { hex: "#5B7F95", group: "My accent colours" },
  { hex: "#7EC8E3", group: "My accent colours" },
  { hex: "#5A7D6D", group: "My accent colours" },
  { hex: "#e4a8aa", group: "My accent colours" },
  { hex: "#5C9BD1", group: "My accent colours" },
  { hex: "#607cac", group: "My accent colours" },
  { hex: "#90C3D4", group: "My accent colours" },

  // --- iOS simple
  { hex: "#ffffff", group: "iOS simple", description: "background", isWhite: true },
  { hex: "#F6F6F6", group: "iOS simple", description: "cards, containers", isWhite: true },
  { hex: "#E0E0E0", group: "iOS simple", description: "borders" },
  { hex: "#A3A3A3", group: "iOS simple", description: "disabled text" },
  { hex: "#6E6E6E", group: "iOS simple", description: "second text" },
  { hex: "#1A1A1A", group: "iOS simple", description: "main text" },
  { hex: "#007AFF", group: "iOS simple", description: "accent" },

  // --- Kuusi light theme
  { hex: "#ffffff", group: "Kuusi light theme", description: "background", isWhite: true },
  { hex: "#2A3140", group: "Kuusi light theme", description: "main text1" },
  { hex: "#0A4A6E", group: "Kuusi light theme", description: "main text2" },
  { hex: "#f5f5f5", group: "Kuusi light theme", description: "cards, containers", isWhite: true },
  { hex: "#A5C3DE", group: "Kuusi light theme", description: "Kuusi light blue" },
  { hex: "#2A68B2", group: "Kuusi light theme", description: "Kuusi blue" },
  { hex: "#5C9BD1", group: "Kuusi light theme", description: "accent" },

  // --- Kuusi dark theme
  { hex: "#1E2633", group: "Kuusi dark theme", description: "background" },
  { hex: "#2A3140", group: "Kuusi dark theme", description: "cards, containers" },
  { hex: "#DCE2EA", group: "Kuusi dark theme", description: "main text" },
  { hex: "#A5C3DE", group: "Kuusi light theme", description: "Kuusi light blue" },
  { hex: "#2A68B2", group: "Kuusi light theme", description: "Kuusi blue" },
  { hex: "#607cac", group: "Kuusi dark theme", description: "accent" },

];
