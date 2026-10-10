import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        plum: {
          950: "#140A1C",
          900: "#24102E",
          800: "#3B1F4A",
          700: "#4E2A63",
          100: "#E7DDEF",
          50: "#F4EEF8",
        },
        gold: {
          600: "#C77F0A",
          500: "#F5A623",
          100: "#FDEBC8",
        },
        cream: "#F7F6F8",
        ink: "#070209",
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
