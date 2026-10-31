/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#102244",
        muted: "#63718C",
        canvas: "#F4F7FC",
        line: "#E4EAF3",
        brand: "#0869F2",
        navy: "#061D43",
        mint: "#08AD7D",
        amber: "#F3A42B",
        danger: "#EA4F63",
      },
    },
  },
  plugins: [],
};
