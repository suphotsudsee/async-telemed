import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#132238",
          sky: "#d6efff",
          leaf: "#0f8a6d",
          warm: "#f7e4c8",
          alert: "#bc4b51"
        }
      },
      boxShadow: {
        soft: "0 20px 60px rgba(19,34,56,0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;

