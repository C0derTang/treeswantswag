/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cardinal: {
          DEFAULT: '#8C1515',
          dark: '#6D0F0F',
          light: '#B83E3E',
        },
        canopy: {
          DEFAULT: '#1a3d2e',
          light: '#2d5a45',
          mist: '#3d6b52',
        },
        /** Soft greens for page backing (light UI) */
        backing: {
          DEFAULT: '#e8f2ec',
          deep: '#d4e8dc',
          mist: '#f2f8f4',
        },
        bark: {
          DEFAULT: '#3d3830',
          light: '#5c554a',
        },
        gold: {
          accent: '#d4a574',
          soft: '#e8d4bc',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass:
          '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'glass-lg':
          '0 25px 50px -12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        /** Light “glass” cards on white + green wash */
        'glass-light':
          '0 4px 24px rgba(15, 60, 40, 0.06), 0 1px 0 rgba(255, 255, 255, 0.9) inset',
        'glass-light-lg': '0 12px 40px -8px rgba(15, 60, 40, 0.1)',
      },
      backgroundImage: {
        'page-wash':
          'linear-gradient(165deg, #dff0e6 0%, #f7fbfa 28%, #ffffff 55%, #f3faf6 100%)',
        'forest-radial':
          'radial-gradient(ellipse 120% 80% at 50% -20%, rgba(45, 90, 69, 0.45) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 100% 50%, rgba(140, 21, 21, 0.12) 0%, transparent 45%)',
      },
    },
  },
  plugins: [],
}
