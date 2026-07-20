/* TrulyVeg service worker — offline app shell + runtime caching.
   Bump CACHE when you ship changes so clients pick up new files. */
var CACHE = "trulyveg-v1";

/* Same-origin app shell to precache for offline use. */
var SHELL = [
  "/",
  "/index.html",
  "/products.html",
  "/compare.html",
  "/hidden-nonveg.html",
  "/why-veg.html",
  "/store.html",
  "/about.html",
  "/label-scanner.html",
  "/404.html",
  "/css/style.css",
  "/js/main.js",
  "/js/label-scanner.js",
  "/js/vendor/tesseract.min.js",
  "/site.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      /* Best-effort: don't fail the whole install if one asset 404s. */
      return Promise.allSettled(SHELL.map(function (url) { return cache.add(url); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);
  /* Only handle our own origin — let CDN (fonts, Tesseract worker/wasm) pass through. */
  if (url.origin !== self.location.origin) return;

  /* Navigations: network-first so content stays fresh, cache as offline fallback. */
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match("/404.html");
        });
      })
    );
    return;
  }

  /* Static assets: stale-while-revalidate. */
  event.respondWith(
    caches.match(req).then(function (hit) {
      var fetchPromise = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || fetchPromise;
    })
  );
});
