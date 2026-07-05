/* ColorFlow · service worker (offline-first) */
var CACHE = 'colorflow-v1';
var ASSETS = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install', function(e){ self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).catch(function(){})); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.map(function(k){if(k!==CACHE)return caches.delete(k);}));}).then(function(){return self.clients.claim();})); });
self.addEventListener('fetch', function(e){
  var req=e.request; if(req.method!=='GET') return;
  var url=new URL(req.url); if(url.origin!==location.origin) return;
  e.respondWith(caches.match(req).then(function(cached){
    var net=fetch(req).then(function(res){ if(res&&res.status===200){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});} return res; }).catch(function(){return cached;});
    return cached||net; }));
});
