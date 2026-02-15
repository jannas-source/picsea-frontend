import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#1E40AF",
        "primary-light": "#2563EB",
        "accent-cyan": "#38BDF8",
        "deep-abyss-blue": "#0B1120",
        "oceanic-navy": "#0F1D32",
        "pure-white": "#FFFFFF",
      },
    },
  },
  plugins: [],
};
export default config;
