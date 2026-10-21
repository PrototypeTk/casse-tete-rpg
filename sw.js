// Morcelune – service worker : cœur de l'appli en cache, images en cache à la demande
// v9 : précache et page toujours relus sur le réseau (cache:'reload'/'no-cache'), jamais le cache HTTP (max-age=600 de GitHub Pages)
const V='morcelune-v16',CORE=['./','./index.html','./puzzle.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-512-maskable.png','./icons/apple-touch-icon.png','./icons/favicon.ico','./icons/titre.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>fetch(new Request(u,{cache:'reload'})).then(n=>{if(n.ok)return c.put(u,n)}).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('morcelune')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data=='skipWaiting')self.skipWaiting()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;const u=new URL(r.url);
 if(r.mode==='navigate'||/\.html$|\/$/.test(u.pathname)){// réseau d'abord (sans cache HTTP) pour la page, repli cache hors ligne
  const key=/puzzle\.html$/.test(u.pathname)?'./puzzle.html':'./index.html';
  e.respondWith(fetch(r.url,{cache:'no-cache',credentials:'same-origin'}).then(n=>{if(n.ok){const c=n.clone();caches.open(V).then(x=>x.put(key,c))}return n}).catch(()=>caches.match(key).then(m=>m||caches.match('./index.html')||caches.match('./'))));return}
// v12 : une image absente du cache est revalidée auprès du serveur (cache:'no-cache'), pour ne jamais remettre en cache une ancienne version d'une image remplacée
 e.respondWith(caches.match(r).then(m=>m||fetch(r,{cache:'no-cache'}).then(n=>{if(n.ok){const c=n.clone();caches.open(V).then(x=>x.put(r,c))}return n})))});
