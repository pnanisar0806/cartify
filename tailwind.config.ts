import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { primary: "#16634b", ink: "#183c31" } } },
  plugins: [],
} satisfies Config;
