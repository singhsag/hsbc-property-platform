import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0eaff",
          600: "#1e40af",
          700: "#1d3a9f",
          900: "#0f1f5c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
