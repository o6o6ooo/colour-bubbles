import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media", // ← これが重要
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
