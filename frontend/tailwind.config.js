/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'chakra-dark': '#0a0a0a',
                'chakra-darker': '#050505',
                'chakra-gray': '#1a1a1a',
                'chakra-red': '#8b0000',
                'chakra-orange': '#ff6b35',
                'chakra-gold': '#d4af37',
                'chakra-blue': '#16213e',
                'chakra-border': '#333333',
            },
            fontFamily: {
                'cinzel': ['Cinzel', 'serif'],
                'inter': ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'red-glow': '0 0 20px rgba(139, 0, 0, 0.5)',
                'gold-glow': '0 0 15px rgba(212, 175, 55, 0.4)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.5s ease-in',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
