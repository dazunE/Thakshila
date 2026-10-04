import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Build for the hosted (claude.ai Artifact) version: one page, React from
 * cdnjs instead of bundled. `npm run build:artifact` wraps the output.
 */
const shim = (f: string) => fileURLToPath(new URL(`./artifact/shims/${f}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^react\/jsx-(dev-)?runtime$/, replacement: shim('jsx-runtime.js') },
      { find: /^react-dom\/client$/, replacement: shim('react-dom-client.js') },
      { find: /^react$/, replacement: shim('react.js') },
    ],
  },
  build: {
    outDir: 'dist-artifact/build',
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
  },
});
