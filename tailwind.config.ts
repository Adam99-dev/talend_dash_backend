import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary accent
        accent: "#FF5A5F",
        // Text hierarchy
        "text-deep": "#222222",
        "text-body": "#484848",
        "text-muted": "#717171",
        // Backgrounds
        "bg-surface": "#FFFFFF",
        "bg-app": "#F7F7F7",
        // Interactive
        "border-light": "#EBEBEB",
        "bg-hover": "#F2F2F2",
        // Status colors
        "success-green": "#008A05",
        "warning-orange": "#FFB400",
        "error-red": "#D93025",
        // Data colors (for salary highlights)
        "data-blue": "#0369A1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
