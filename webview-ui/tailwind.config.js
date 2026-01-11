/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                geist: {
                    background: '#000000',
                    surface: '#111111',
                    accents: {
                        1: '#111111',
                        2: '#333333',
                        3: '#444444',
                        4: '#666666',
                        5: '#888888',
                        6: '#999999',
                        7: '#eaeaea',
                        8: '#fafafa',
                    },
                    error: '#ff0000',
                    success: '#0070f3',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
