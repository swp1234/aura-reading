const CACHE_NAME = 'aura-reading-v1';
const ASSETS = [
  '/aura-reading/',
  '/aura-reading/index.html',
  '/aura-reading/css/style.css',
  '/aura-reading/js/app.js',
  '/aura-reading/js/i18n.js',
  '/aura-reading/js/locales/ko.json',
  '/aura-reading/js/locales/en.json',
  '/aura-reading/js/locales/ja.json',
  '/aura-reading/js/locales/zh.json',
  '/aura-reading/js/locales/hi.json',
  '/aura-reading/js/locales/ru.json',
  '/aura-reading/js/locales/es.json',
  '/aura-reading/js/locales/pt.json',
  '/aura-reading/js/locales/id.json',
  '/aura-reading/js/locales/tr.json',
  '/aura-reading/js/locales/de.json',
  '/aura-reading/js/locales/fr.json',
  '/aura-reading/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
