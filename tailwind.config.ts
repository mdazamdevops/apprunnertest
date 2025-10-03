import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          600: "hsl(var(--brand-600))",
          700: "hsl(var(--brand-700))"
        }
      }
    }
  },
  plugins: []
};

export default config;
