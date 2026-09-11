import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as {
  start_url: string; scope: string; display: string; icons: { purpose?: string }[];
};
const serviceWorker = readFileSync('public/sw.js', 'utf8');
const appSource = readFileSync('src/App.tsx', 'utf8');

describe('PWA delivery contract', () => {
  it('declares an installable GitHub Pages-scoped application', () => {
    expect(manifest.start_url).toBe('/PWA-Product-Catalog/');
    expect(manifest.scope).toBe('/PWA-Product-Catalog/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: '/PWA-Product-Catalog/favicon.svg', type: 'image/svg+xml' }),
      expect.objectContaining({ purpose: 'any' }),
      expect.objectContaining({ purpose: 'maskable' }),
    ]));
    expect(appSource).toContain("from './icons'");
    expect(appSource).toContain('favicon.svg');
    expect(appSource).toContain('updateInfo.version');
    expect(appSource).toContain('labels.updateNow');
  });

  it('keeps Service Worker caching same-origin GET-only and user-controlled', () => {
    expect(serviceWorker).toContain("request.method !== 'GET'");
    expect(serviceWorker).toContain("url.origin !== self.location.origin");
    expect(serviceWorker).toContain("event.data?.type === 'SKIP_WAITING'");
    expect(serviceWorker).toContain("event.data?.type === 'GET_VERSION'");
    expect(serviceWorker).toContain('APP_VERSION');
    expect(serviceWorker).toContain('self.clients.claim()');
    expect(serviceWorker).toContain('networkFirst(request)');
  });
});
