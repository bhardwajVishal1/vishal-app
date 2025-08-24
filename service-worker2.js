const CACHE = 'eco-reward-cache-v1';
const FILES = [
  './index2.html','./style2.css','./app2.js','./manifest2.json',
  './icons/icon-192.png','./icons/icon-512.png'
];

self.addEventListener('install', evt=>{
  evt.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', evt=>{ evt.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', evt=>{
  evt.respondWith(caches.match(evt.request).then(r=>r || fetch(evt.request)));
});
