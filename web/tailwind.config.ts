import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#BB86FC',
          variant: '#3700B3',
        },
        secondary: {
          DEFAULT: '#03DAC6',
        },
        background: '#121212',
        surface: '#121212',
        error: '#CF6679',
        'on-primary': '#000000',
        'on-secondary': '#000000',
        'on-background': '#FFFFFF',
        'on-surface': '#FFFFFF',
        'on-error': '#000000',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
