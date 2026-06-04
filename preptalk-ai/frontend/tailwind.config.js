/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          50: '#F6F5FF',
          100: '#EAE8FF',
          300: '#BFB8FF',
          500: '#6C63FF',
          700: '#4A43E6'
        },
        secondary: {
          DEFAULT: '#00C2A8',
          50: '#E6FFFB',
          300: '#66F0D9'
        },
        accent: '#FF6B8A',
        dark: '#111827',
        soft: '#F7F8FC'
      }
    }
  },
  plugins: []
};
