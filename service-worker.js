const CACHE_NAME = 'uno-hub-v2';
const URLS = [
  './','./index.html','./manifest.json','./hub_appcfg.js','./icons/192.png','./icons/512.png',
  './archetypes/luxara.html',
  './archetypes/rhea.html',
  './archetypes/aion.html',
  './archetypes/atlas.html',
  './archetypes/nova.html',
  './archetypes/genus.html',
  './archetypes/lumine.html',
  './archetypes/kaion.html',
  './archetypes/kaos.html',
  './archetypes/horus.html',
  './archetypes/elysha.html',
  './archetypes/serena.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(URLS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
      return r;
    }).catch(() => caches.match('./index.html')))
  );
});
