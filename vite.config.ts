import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      // SEC-03: Proxy Groq API requests server-side to avoid exposing API key in browser
      proxy: {
        '/api/groq': {
          target: 'https://api.groq.com',
          changeOrigin: true,
          rewrite: (path) => {
            const rewritten = path.replace(/^\/api\/groq/, '');
            console.log(`[Proxy] ${path} -> ${rewritten}`);
            return rewritten;
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log(`[Proxy] Request: ${req.method} ${req.url}`);
              // Inject the API key server-side — never sent to the browser
              if (env.GROQ_API_KEY) {
                proxyReq.setHeader('Authorization', `Bearer ${env.GROQ_API_KEY}`);
              } else {
                console.error('[Proxy] CRITICAL: GROQ_API_KEY NOT FOUND IN ENV');
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log(`[Proxy] Response code: ${proxyRes.statusCode}`);
            });
          },
        },
      },
    },
    plugins: [react()],
    // SEC-02: Removed GROQ_API_KEY from define — it was being inlined into the client bundle
    define: {
      'process.env.API_KEY': JSON.stringify(''),
      'process.env.GEMINI_API_KEY': JSON.stringify(''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-groq': ['groq-sdk'],
            'vendor-supabase': ['@supabase/supabase-js'],
          }
        }
      }
    }
  };
});
