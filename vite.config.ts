import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const packageVersion = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')).version as string;

function versionServiceWorker(): Plugin {
  return {
    name: 'version-service-worker',
    apply: 'build',
    closeBundle() {
      const swPath = resolve(process.cwd(), 'dist/sw.js');
      const source = readFileSync(swPath, 'utf8');
      const buildVersion = process.env.GITHUB_SHA?.slice(0, 7) ?? new Date().toISOString();
      writeFileSync(swPath, source.replace('__BUILD_VERSION__', buildVersion).replace('__APP_VERSION__', packageVersion), 'utf8');
    },
  };
}

export default defineConfig({
  base: '/PWA-Product-Catalog/',
  define: {
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION ?? packageVersion),
  },
  plugins: [react(), versionServiceWorker()],
  server: {
    port: 5173,
  },
});
