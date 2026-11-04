import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Makes the accessibility menu's text-size control reach all text. Nearly every font-size in the CSS is written in px, which ignores the
 * browser's root size, so scaling the root only changed a few headings. This wraps each absolute font-size (a length in px or rem, or a
 * clamp/min/max of them) as calc(<size> * var(--a11y-text-scale, 1)); the variable is 1 unless the visitor picks a larger size.
 * Sizes in em or % are left alone because they follow their parent, which is already scaled.
 */
const scaleText = {
  postcssPlugin: 'sd-scale-text',
  Declaration: {
    'font-size': (decl: { value: string }) => {
      const value = decl.value.trim();
      if (value.includes('--a11y-text-scale') || value.includes('var(') || value.includes('%')) return;
      if (/\d(em|ex|ch)\b/i.test(value)) return;
      const isLength = /^-?\d*\.?\d+(px|rem)$/i.test(value);
      const isMath = /^(clamp|min|max)\(/i.test(value);
      if (!isLength && !isMath) return;
      decl.value = `calc(${value} * var(--a11y-text-scale, 1))`;
    },
  },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // Search-engine indexing is OFF unless VITE_ALLOW_INDEXING=true is set
  // at build time — a staging/pre-launch build can never be indexed by
  // accident, and going live is one env var, not a code change.
  const robots = env.VITE_ALLOW_INDEXING === 'true' ? 'index, follow' : 'noindex, nofollow';

  return {
    plugins: [
      react(),
      {
        name: 'html-robots-meta',
        transformIndexHtml: (html: string) => html.replace('%ROBOTS%', robots),
      },
    ],
    css: { postcss: { plugins: [scaleText] } },
    build: {
      rollupOptions: {
        output: {
          // The framework changes rarely, so it gets its own file that browsers keep cached across releases.
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: { '/api': 'http://localhost:4000' },
    },
  };
});
