/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Sporty Attio×Legora Design Tokens
      borderRadius: {
        'sm': '4px',    // Tighter radii
        'md': '6px',
        'lg': '8px',
        'xl': '10px',
        '2xl': '12px',
      },
      colors: {
        // Single accent blue
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Main accent
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Add hairline gray (extends default grays)
        gray: {
          150: '#ececec',
        },
      },
      borderWidth: {
        'hairline': '0.5px',  // Darker hairlines
      },
      transitionDuration: {
        '170': '170ms',  // Faster motion
      },
      fontSize: {
        'xxs': ['10px', '14px'],
      },
      spacing: {
        '18': '4.5rem',
      },
      boxShadow: {
        'lift': '0 2px 8px -2px rgba(0, 0, 0, 0.08)',  // Subtle lift
        'lift-lg': '0 4px 12px -2px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

