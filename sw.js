var CACHE = 'budget-mudik-v3';

// Hanya cache assets statis, BUKAN index.html
var STATIC = ['./manifest.json'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(STATIC); })
  );
  self.skipWaiting();
});

// Terima pesan dari halaman untuk skip waiting
self.addEventListener('message', function(e){
  if(e.data && e.data.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', function(e){
  // Hapus semua cache lama
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;

  // index.html: SELALU ambil dari network (tidak pernah dari cache)
  if(url.endsWith('/') || url.includes('index.html') || url.includes('budget-mudik/')){
    e.respondWith(
      fetch(e.request).catch(function(){
        // Kalau offline, baru pakai cache
        return caches.match('./index.html');
      })
    );
    return;
  }

  // File lain (manifest, font, dll): cache-first
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(res){
        var clone = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return res;
      });
    })
  );
});
