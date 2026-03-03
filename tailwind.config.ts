import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        reborn: {
          bg: "#0a0a0a",
          card: "#141414",
          border: "#1e1e1e",
          accent: "#3b82f6",
          "accent-hover": "#2563eb",
          muted: "#71717a",
          text: "#fafafa",
          "text-secondary": "#a1a1aa",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
