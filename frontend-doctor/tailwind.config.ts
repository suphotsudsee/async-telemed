import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0f172a"
        },
        clinic: {
          mist: "#e7edf5",
          blue: "#2563eb",
          amber: "#f59e0b",
          red: "#dc2626"
        }
      }
    }
  },
  plugins: []
} satisfies Config;

