import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': 'var(--color-primary-bg)',
        'primary-text': 'var(--color-primary-text)',
        'secondary-bg': 'var(--color-secondary-bg)',
        'secondary-text': 'var(--color-secondary-text)',
        'border-color': 'var(--color-border-color)',
      },
    },
  },
  plugins: [],
} satisfies Config;
