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
        "bioluminescent-cyan": "#00F0FF",
        "deep-abyss-blue": "#000C18",
        "oceanic-navy": "#002B45",
        "pure-white": "#FFFFFF",
      },
    },
  },
  plugins: [],
};
export default config;
