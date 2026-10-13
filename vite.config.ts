import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Matches modules inside the named node_modules packages, with either path separator.
const vendor = (...packages: string[]) =>
  new RegExp(
    `[\\\\/]node_modules[\\\\/](${packages.map((name) => name.replace('/', '[\\\\/]')).join('|')})[\\\\/]`
  );

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/pogo-calendar',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // React core
            {
              name: 'react-vendor',
              test: vendor('react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'),
            },

            // Radix UI primitives
            { name: 'radix-vendor', test: vendor('@radix-ui/[^\\\\/]+') },
            { name: 'icons', test: vendor('lucide-react') },
            { name: 'pickers', test: vendor('react-day-picker', 'cmdk') },

            // FullCalendar
            {
              name: 'fullcalendar',
              test: vendor('@fullcalendar/core', '@fullcalendar/react', '@full-ui/headless-calendar', 'temporal-polyfill'),
            },

            // Date utilities
            { name: 'date-utils', test: vendor('date-fns') },

            // Other utilities
            { name: 'utils', test: vendor('ics', 'uuid') },
          ],
        },
      },
    },
    // Increase chunk size warning limit to 1000 kB (default is 500 kB)
    chunkSizeWarningLimit: 1000,
  },
});
