/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        gcibn: {
          'forest': '#115930',
          'lime': '#C7D943',
          'marigold': '#F2C438',
          'cream': '#F2D479',
          'black': '#0D0D0D'
        }
      }
    }
  },
  plugins: []
};
