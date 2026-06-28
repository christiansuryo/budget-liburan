var CACHE = 'bgt-' + Date.now();

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  var isHTML = url.endsWith('/') || url.includes('index.html') || 
               (url.includes('budget-mudik') && !url.includes('.'));
  
  if(isHTML || url.includes('.js') || url.includes('.webp') || url.includes('.png') || url.includes('.json')){
    // Network first - always try to get fresh version
    e.respondWith(
      fetch(e.request.clone()).then(function(res){
        var clone = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return res;
      }).catch(function(){
        return caches.match(e.request);
      })
    );
  }
});

self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
