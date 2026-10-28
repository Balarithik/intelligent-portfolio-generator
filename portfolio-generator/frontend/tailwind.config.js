/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-slate': '#F5F5F7',
        'dark-charcoal': '#1D1D1F',
        'border-gray': '#AAAAAA',
        'accent-blue': '#007AFF',
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"Segoe UI"',
          "Roboto",
          "sans-serif"
        ],
      },
      boxShadow: {
        'apple-subtle': '0 2px 8px -1px rgba(0, 0, 0, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
        'apple-card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '18px',
      }
    },
  },
  plugins: [],
}

