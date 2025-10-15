const CACHE='uno-mono-alias-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(all=>Promise.all(all.map(k=>k!==CACHE&&caches.delete(k))))) });
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(res=>res||fetch(e.request).then(r=>{
      const cc=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cc)); return r;
    }).catch(_=>caches.match('./index.html'))));
  }
});
