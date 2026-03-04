// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://financieramentecompany.com',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  server: {
    host: true, // Esto le dice a Node que escuche en 0.0.0.0 en lugar de localhost
    port: 4321
  },

  output: 'server',

  adapter: node({
    mode: 'standalone'
  })
});