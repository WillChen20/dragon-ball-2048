const CACHE_NAME = 'db2048-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './img/LogoDBZ.png',
  // ADICIONE AQUI O CAMINHO DE TODAS AS SUAS IMAGENS (Goku, Freeza, etc)
  './img/DBZ/goku.png',
  './img/DBZ/gokuend.png',
  './img/DBZ/gokufinal.png',
  './img/DBZ/gokugorila.png',
  './img/DBZ/gokukaioken.png',
  './img/DBZ/gokuKid.png',
  './img/DBZ/gokussj.png',
  './img/DBZ/gokussj2.png',
  './img/DBZ/gokussj3.png',
  './img/DBZ/gokuT23.png',
  './img/DBZ/gokutransform.png',
  './img/DBS/goku.png',
  './img/DBS/gokublue.png',
  './img/DBS/gokubluekaioken.png',
  './img/DBS/gokubluekaiokengenkidama.png',
  './img/DBS/gokucompleto.png',
  './img/DBS/gokugod.png',
  './img/DBS/gokuincomplete.png',
  './img/DBS/gokussj.png',
  './img/DBS/gokussj2.png',
  './img/DBS/gokussj3.png',
  './img/DBS/gokutransform.png',
  './img/DBGT/goku.png',
  './img/DBGT/godengorila.png',
  './img/DBGT/gokuend.png',
  './img/DBGT/gokugenkidama.png',
  './img/DBGT/gokumini.png',
  './img/DBGT/gokussj.png',
  './img/DBGT/gokussj2.png',
  './img/DBGT/gokussj3.png',
  './img/DBGT/gokussj4.png',
  './img/DBGT/gokussj5.png',
  './img/DBGT/gokussjfull.png'
];

// Instalação: Salva os arquivos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Resposta: Se estiver offline, pega do cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Apenas para descobrir o culpado:
ASSETS.forEach(asset => {
  fetch(asset).then(res => {
    if(!res.ok) console.error("Arquivo não encontrado para o Cache:", asset);
  });
});