
/* Rádio Sua Vez — Service Worker PWA */
const CACHE_NAME = "radio-sua-vez-pwa-v1";
const BASE = "/r-dio-sua-vez/";

const ARQUIVOS = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.webmanifest",
  BASE + "icon-192.png",
  BASE + "icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ARQUIVOS)
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (nomes) => {
      await Promise.all(
        nomes
          .filter((nome) =>
            nome.startsWith("radio-sua-vez-pwa-") &&
            nome !== CACHE_NAME
          )
          .map((nome) => caches.delete(nome))
      );
      await self.clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Não armazenar áudio, pagamentos, dados de artistas
  // nem respostas de serviços externos.
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(BASE)) return;

  const arquivosEstaticos = [
    BASE + "manifest.webmanifest",
    BASE + "icon-192.png",
    BASE + "icon-512.png"
  ];

  if (arquivosEstaticos.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((salvo) =>
        salvo || fetch(request)
      )
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(BASE + "index.html")
      )
    );
  }
});
