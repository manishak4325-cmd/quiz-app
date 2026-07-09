/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B1035",
        panel: "#241347",
        coral: "#FF5D73",
        lime: "#C6FF3D",
        gold: "#FFC93C",
        sky: "#4FD1FF",
      },
      fontFamily: {
        display: ["Baloo 2", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        pop: "0 6px 0 rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
