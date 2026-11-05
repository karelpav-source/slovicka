// Jakubova slovíčka: s internetem vždy nejnovější verze, bez internetu poslední uložená.
// Obsluhuje jen vlastní soubory stránky; cizí (Firebase od Googlu) jdou rovnou na internet.
const CACHE = 'slovicka-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { if (!r.ok) throw new Error('bad'); const kopie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, kopie)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
