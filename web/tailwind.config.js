/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 40px rgba(251, 191, 36, 0.15)",
      },
      backgroundImage: {
        haze: "radial-gradient(circle at top, rgba(59,130,246,0.18), transparent 45%), radial-gradient(circle at bottom, rgba(251,191,36,0.08), transparent 40%)",
      },
    },
  },
  plugins: [],
}
