/*@type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          // Professional Pet Care System Colors
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#6638E6', // Main purple
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          pink: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#E6738F', // Main pink
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
          },
          highlight: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#f9a8d4',
            300: '#f472b6',
            400: '#E69AAE', // Highlight darker
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
          },
          // Legacy colors for compatibility
          defaultWhite: '#ffffff',
          defaultGrey: 'rgb(141, 141, 141)',
          defaultBlack: '#000000',
          defaultRed: '#a1020a',
          primaryBlue: '#48448c',
          primaryCyan: '#26C6DA',
          secondaryBlue: '#3182ce',
          
          primary: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#6638E6', 
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          secondary: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#E6738F', 
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
          },
          accent: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#a1020a', 
            800: '#991b1b',
            900: '#7f1d1d',
          },
          neutral: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#8d8d8d', 
            600: '#737373',
            700: '#525252',
            800: '#404040',
            900: '#262626',
          }
        },
        fontFamily: {        
          gilroyHeavy: ['Gilroy Heavy', 'sans-serif'],
          gilroyBold: ['Gilroy Bold', 'sans-serif'],
          gilroyRegular: ['Gilroy Regular', 'sans-serif'],
          gilroyLight: ['Gilroy  Light', 'sans-serif']
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
          popIn: {
            '0%': { opacity: 0, transform: 'scale(0.95)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
        },
        animation: {
          'fade-in': 'fadeIn 1s ease-out',
          'pop-in': 'popIn 0.5s cubic-bezier(0.4,0,0.2,1)',
        },
      },
    },
    plugins: [],
  }


  
  