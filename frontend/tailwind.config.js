/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "Lattice" deep indigo - primary brand color, used for sidebar/headers/primary buttons
        lattice: {
          50: "#eef0fb",
          100: "#d9ddf5",
          200: "#b3bbeb",
          300: "#8d99e1",
          400: "#5c6ed1",
          500: "#4147c4",
          600: "#3538a3",
          700: "#2a2c80",
          800: "#20225e",
          900: "#161741",
        },
        // "Signal" amber - the one accent color reserved for calls-to-action,
        // due-soon badges, and the notification dot. Used sparingly.
        signal: {
          50: "#fff8ea",
          400: "#f6b83a",
          500: "#ef9f0f",
          600: "#c97f08",
        },
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
