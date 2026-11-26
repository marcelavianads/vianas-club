/* Guarda o app no aparelho para abrir sem internet. Não guarda nem envia seus treinos.
   Quando mudar algum arquivo, troque o número em CACHE (ex.: vianasfit-v2) para o celular pegar a versão nova. */
const CACHE = 'vianasfit-v5';
const BASE = ['./', 'index.html', 'estilo.css', 'app.js', 'treinos.js', 'manifest.webmanifest',
  'icones/icone-192.png', 'icones/icone-512.png', 'icones/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('vianasfit-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Responde na hora com a cópia guardada e, em paralelo, busca a versão nova para a próxima abertura.
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  const chave = r.mode === 'navigate' ? './' : r;
  e.respondWith(caches.open(CACHE).then(async c => {
    const copia = await c.match(chave, { ignoreSearch: true });
    // cache: 'no-cache' = sempre pergunta ao servidor se há versão nova (não usa a cópia velha do navegador)
    const rede = fetch(new Request(r.url, { cache: 'no-cache', credentials: 'same-origin' })).then(x => { if (x.ok) c.put(chave, x.clone()); return x; }).catch(() => copia);
    return copia || rede;
  }));
});
