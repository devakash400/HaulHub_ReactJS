/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2F5D3A",
        background: "#F6F1E8",
      },
      maxWidth: {
        container: "1280px",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.06)",
        "soft-lg": "0 4px 16px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

