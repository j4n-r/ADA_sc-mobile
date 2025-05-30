/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./**/*.tsx', './components/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {},
    },
    plugins: [],
};
