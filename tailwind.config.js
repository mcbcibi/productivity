/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F7F5',
          100: '#E8EFEA',
          200: '#D5E1D8',
          300: '#B6CBC0',
          400: '#92B0A1',
          500: '#729584',
          600: '#587667',
          700: '#465D52',
          800: '#3A4C43',
          900: '#222E28',
          950: '#151D19',
        },
        brand: {
          yellow: '#FFD43B',
          yellowHover: '#FCC419',
        },
        sidebar: {
          light: '#F4F4F5',
          dark: '#18181B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.03)',
        'sticky': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
