import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const stripModuleType = {
  name: 'strip-module-type',
  enforce: 'post',
  transformIndexHtml(html) {
    return html.replace(/<script type="module"([^>]*)>/g, '<script$1>');
  },
};

export default defineConfig({
  plugins: [viteSingleFile(), stripModuleType],
  server: { port: 5173, open: false },
  optimizeDeps: { exclude: ['@dimforge/rapier3d-compat'] },
  build: {
    target: 'es2020',
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});
