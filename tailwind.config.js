/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "wave-rl": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(50%)" },
        },
        "wave-updown": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        waveCombine:
          "wave-rl 3s linear infinite, wave-updown 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
