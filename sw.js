// Bia PWA — Service Worker
const CACHE = 'bia-v1';
const ASSETS = [
  '/bia-conecte/',
  '/bia-conecte/index.html',
  '/bia-conecte/manifest.json',
  '/bia-conecte/icon-192.png',
  '/bia-conecte/icon-512.png'
];

// Instalar — cachear assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Ativar — limpar caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', e => {
  // Não interceptar chamadas externas (N8N, ElevenLabs, Meta)
  const url = new URL(e.request.url);
  if (!url.origin.includes('github.io')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
