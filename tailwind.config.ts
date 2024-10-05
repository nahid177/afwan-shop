import type { Config } from "tailwindcss";
import daisyui from "daisyui";
import flowbitePlugin from "flowbite/plugin";

const config: Config = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui,
    flowbitePlugin,
  ],
};

export default config;
