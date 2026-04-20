/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'madeira-clara': '#C4A57B',
        'madeira-escura': '#5C3D2E',
        'verde-floresta': '#1F3A2E',
        'verde-musgo': '#3D5A4A',
        'creme-papel': '#F5EFE6',
        'dourado-vintage': '#C9A961',
        'preto-quente': '#1A1510',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      fontSize: {
        base: ['18px', '1.6'],
      },
    },
  },
  plugins: [],
}
