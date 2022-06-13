module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        'in-world-ui': 'minmax(200px, 420px) 1fr 250px',
      },
      gridTemplateRows: {
        'in-world-ui': '300px 1fr 20px',
      }
    }
  },
  plugins: [],
}
