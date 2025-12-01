/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/Pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: { themes: ["light"] },
};
