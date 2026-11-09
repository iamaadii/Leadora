import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (res.writeHead && !res.headersSent) {
              res.writeHead(503, {
                'Content-Type': 'application/json',
              });
              res.end(
                JSON.stringify({
                  success: false,
                  error: {
                    code: 'BACKEND_OFFLINE',
                    message:
                      'Backend Express server is not running on http://localhost:5000. Start it in a separate terminal with "npm run dev:api" or run "npm run dev".',
                    details: err.message,
                  },
                })
              );
            }
          });
        },
      },
    },
  },
});
