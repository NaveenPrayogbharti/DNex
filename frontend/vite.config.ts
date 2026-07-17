import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { docGenPlugin } from './vite-plugin-doc-gen.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isPublicOnly = env.VITE_PUBLIC_ONLY === 'true';

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Only run doc-gen in dev (skipped in production builds for speed)
      mode === 'development' ? docGenPlugin() : null,
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    assetsInclude: ['**/*.svg', '**/*.csv'],

    // ── Dependency Pre-Bundling ──────────────────────────────────────────────
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router',
        '@supabase/supabase-js',
        'lucide-react',
        'recharts',
        'motion',
        '@mui/material',
        '@mui/icons-material',
        'react-hook-form',
        'sonner',
        'date-fns',
      ],
    },

    // ── Production Build Optimisations ──────────────────────────────────────
    build: {
      // Raise warning threshold to avoid false alarms on vendor chunks
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          // Manual chunk splitting — separates vendor code into cacheable chunks
          manualChunks(id) {
            // Core React runtime
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-runtime';
            }
            // React Router
            if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
              return 'react-router';
            }
            // Supabase (large SDK)
            if (id.includes('node_modules/@supabase')) {
              return 'supabase';
            }
            // Radix UI primitives
            if (id.includes('node_modules/@radix-ui')) {
              return 'radix-ui';
            }
            // MUI (only in full build)
            if (!isPublicOnly && (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion'))) {
              return 'mui';
            }
            // Charts (only in full build — used by CRM analytics)
            if (!isPublicOnly && id.includes('node_modules/recharts')) {
              return 'recharts';
            }
            // Lucide icons — split separately (large)
            if (id.includes('node_modules/lucide-react')) {
              return 'lucide-icons';
            }
            // Motion / animation
            if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
              return 'animation';
            }
            // Let Vite handle remaining node_modules automatically (no explicit vendor chunk)
            // This avoids the circular‑chunk warning caused by bundling react‑runtime & vendor together.
          },
        },
      },

      // Use esbuild for minification (faster than terser, good enough for prod)
      minify: 'esbuild',

      // Generate source maps only when NOT building a public‑only bundle (helps debugging on any server)
      sourcemap: !isPublicOnly,
    },

    // ── Dev-server proxy ─────────────────────────────────────────────────────
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_API_URL || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
