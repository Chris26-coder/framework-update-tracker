import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { exec } from 'child_process'

function pipelineRunnerPlugin(): Plugin {
  return {
    name: 'pipeline-runner-plugin',
    configureServer(server) {
      server.middlewares.use('/api/run-pipeline', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            let slug = '';
            try {
              if (body) {
                const parsed = JSON.parse(body);
                slug = parsed.slug || '';
              }
            } catch (e) {}

            const rootDir = path.resolve(process.cwd(), '..');
            const pythonPath = path.resolve(rootDir, '.venv', 'Scripts', 'python.exe');
            const cmd = slug
              ? `"${pythonPath}" -m pipeline --slug ${slug}`
              : `"${pythonPath}" -m pipeline`;

            console.log(`[Pipeline Trigger] Executing: ${cmd}`);
            exec(cmd, { cwd: rootDir }, (err, stdout, stderr) => {
              res.setHeader('Content-Type', 'application/json');
              if (err) {
                console.error('[Pipeline Trigger Error]:', stderr || err.message);
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: stderr || err.message }));
              } else {
                console.log('[Pipeline Trigger Success]');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: 'Pipeline executed successfully' }));
              }
            });
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pipelineRunnerPlugin()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/supabase': {
        target: 'https://gtdymznghrmoiiqnjsol.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/supabase/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Strip browser headers and set backend user-agent so Supabase Gateway treats it as a server request
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            proxyReq.removeHeader('sec-fetch-mode');
            proxyReq.removeHeader('sec-fetch-site');
            proxyReq.removeHeader('sec-fetch-dest');
            proxyReq.removeHeader('sec-ch-ua');
            proxyReq.removeHeader('sec-ch-ua-mobile');
            proxyReq.removeHeader('sec-ch-ua-platform');
            proxyReq.setHeader('user-agent', 'Framework-Tracker-Backend/1.0');
          });
        },
      },
    },
  },
})
