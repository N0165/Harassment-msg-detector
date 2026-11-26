import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// The build inlines all JS and CSS into dist/index.html so it opens by double-click (file://).
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  server: { port: 5173 },
});
