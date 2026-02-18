/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                claudia: {
                    dark: '#0a0a0a', // Dark background
                    secondary: '#1a1a1a', // Secondary dark
                    primary: '#D4AF37', // Gold/Metallic
                    accent: {
                        green: '#C6FF00', // Neon Lime Green - High Contrast
                        orange: '#FF9800', // Bright Orange
                        purple: '#9C27B0', // Purple
                        blue: '#2979FF', // Bright Blue
                    },
                    text: {
                        light: '#F3F4F6', // Off-white for text on dark bg
                        gray: '#D1D5DB', // Light gray for secondary text
                        dark: '#1F2937', // Dark text for light bg
                    }
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                script: ['Dancing Script', 'cursive'],
            }
        },
    },
    plugins: [],
}
