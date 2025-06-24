/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          'sans': ['Inter', 'system-ui', 'sans-serif'],
        },
        animation: {
          'spin-slow': 'spin 3s linear infinite',
        },
        backdropBlur: {
          xs: '2px',
        }
      },
    },
    plugins: [],
    future: {
      hoverOnlyWhenSupported: true,
    },
    experimental: {
      optimizeUniversalDefaults: true,
    }
  }