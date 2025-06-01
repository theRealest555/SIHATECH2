// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all relevant files in your src directory
  ],
  theme: {
    extend: {
      // You can extend the default Tailwind theme here if needed.
      // For a "nice and pro" look, the default theme is often a great starting point.
      // Example: adding custom colors or fonts
      colors: {
        'brand-primary': '#007bff', // Example primary color
        'brand-secondary': '#6c757d',
      },
      fontFamily: {
        // Adds 'Inter' to the sans-serif stack, making it the default if used in index.css
        // The user's index.css already specified Inter, system-ui, etc.
        // Tailwind's default sans stack is already quite good and similar.
        // sans: ['Inter', ...require('tailwindcss/defaultTheme').fontFamily.sans],
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'), // Uncomment if you want to use Tailwind's form styling plugin
    // require('@tailwindcss/typography'), // Uncomment for prose styling
  ],
}
