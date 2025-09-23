const CACHE_NAME = 'pdv-gesso-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/lovable-uploads/gessoprimus.png',
  '/lovable-uploads/gesso.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline sales
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-sales') {
    event.waitUntil(syncSales());
  }
});

async function syncSales() {
  try {
    const offlineSales = await getOfflineSales();
    for (const sale of offlineSales) {
      await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale)
      });
    }
    await clearOfflineSales();
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
}

async function getOfflineSales() {
  // Get offline sales from IndexedDB or localStorage
  const offlineSales = JSON.parse(localStorage.getItem('offlineSales') || '[]');
  return offlineSales;
}

async function clearOfflineSales() {
  localStorage.removeItem('offlineSales');
}