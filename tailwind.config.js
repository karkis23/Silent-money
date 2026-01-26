import typography from '@tailwindcss/typography';

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
                // Modern, vibrant palette
                primary: {
                    50: '#f0f4ff',
                    100: '#d9e2ff',
                    200: '#bccbff',
                    300: '#94a9ff',
                    400: '#647aff',
                    500: '#3d4aff', // Electric Blue
                    600: '#2529ff',
                    700: '#1a1eff',
                    800: '#1418cc',
                    900: '#1014a3',
                    950: '#0a0c61',
                },
                accent: {
                    light: '#7ee787', // Neon Green
                    DEFAULT: '#3fb950',
                    dark: '#2ea043',
                },
                charcoal: {
                    50: '#f6f6f6',
                    100: '#e7e7e7',
                    200: '#d1d1d1',
                    300: '#b0b0b0',
                    400: '#888888',
                    500: '#6d6d6d',
                    600: '#5d5d5d',
                    700: '#4f4f4f',
                    800: '#454545',
                    900: '#3d3d3d',
                    950: '#181818',
                },
                sage: {
                    50: '#f6f7f6',
                    100: '#e3e7e3',
                    200: '#c7cfc7',
                    300: '#a3b0a3',
                    400: '#7d8f7d',
                    500: '#627462',
                    600: '#4d5c4d',
                    700: '#3f4a3f',
                    800: '#353d35',
                    900: '#2d332d',
                    950: '#181c18',
                },
                cream: {
                    50: '#fafaf9',
                    100: '#f5f5f4',
                    200: '#e7e5e4',
                    300: '#d6d3d1',
                    400: '#a8a29e',
                    500: '#78716c',
                    600: '#57534e',
                    700: '#44403c',
                    800: '#292524',
                    900: '#1c1917',
                },
                money: '#85BB65',
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                'mesh-gradient': 'radial-gradient(at 0% 0%, rgba(61, 74, 255, 0.15) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(126, 231, 135, 0.1) 0, transparent 50%)',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [
        typography,
    ],
}
