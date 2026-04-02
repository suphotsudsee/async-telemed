import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ops: {
          navy: "#102a43",
          cyan: "#19a7ce",
          mint: "#d8f3dc",
          sand: "#fdf0d5",
          coral: "#ef476f"
        }
      }
    }
  },
  plugins: []
} satisfies Config;

