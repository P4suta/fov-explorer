import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// Served from https://p4suta.github.io/fov-explorer/ in production.
const BASE = process.env.VITE_BASE ?? '/fov-explorer/';

export default defineConfig({
  base: BASE,
  plugins: [svelte()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      // Bind-mount + Docker on WSL: poll for changes.
      usePolling: true,
      interval: 200,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },
});
