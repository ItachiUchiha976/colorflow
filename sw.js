/* ColorFlow · service worker (network-first sur le HTML pour éviter les MAJ coincées) */
var CACHE = 'colorflow-v5';
var ASSETS = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512-maskable.png'];
self.addEventListener('install', function(e){ self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).catch(function(){})); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.map(function(k){if(k!==CACHE)return caches.delete(k);}));}).then(function(){return self.clients.claim();})); });
self.addEventListener('fetch', function(e){
  var req=e.request; if(req.method!=='GET') return;
  var url=new URL(req.url); if(url.origin!==location.origin) return;
  var isDoc = req.mode==='navigate' || (req.headers.get('accept')||'').indexOf('text/html')>=0 || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if(isDoc){
    // network-first : toujours la dernière version quand en ligne, cache en secours hors-ligne
    e.respondWith(fetch(req).then(function(res){ if(res&&res.status===200){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});} return res; })
      .catch(function(){ return caches.match(req).then(function(c){return c||caches.match('./index.html');}); }));
    return;
  }
  // autres assets : cache-first + revalidation en arrière-plan
  e.respondWith(caches.match(req).then(function(cached){
    var net=fetch(req).then(function(res){ if(res&&res.status===200){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});} return res; }).catch(function(){return cached;});
    return cached||net; }));
});
