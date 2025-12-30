// Service Worker for BrandBible - Progressive Web App capabilities
const CACHE_NAME = 'brandbible-v1';
const RUNTIME_CACHE = 'brandbible-runtime';
const IMAGE_CACHE = 'brandbible-images';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/favicon.ico',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[ServiceWorker] Failed to cache static assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== CACHE_NAME && name !== RUNTIME_CACHE && name !== IMAGE_CACHE;
          })
          .map((name) => {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and chrome-extension
  if (url.origin !== location.origin || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/') || url.pathname.includes('gemini')) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // Handle images - cache first, network fallback
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Handle static assets - cache first
  event.respondWith(cacheFirst(request, CACHE_NAME));
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[ServiceWorker] Serving from cache:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    // Return offline page or placeholder if available
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, serving from cache:', request.url);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Background sync for offline post scheduling
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-scheduled-posts') {
    event.waitUntil(syncScheduledPosts());
  }
});

async function syncScheduledPosts() {
  try {
    // Get scheduled posts from IndexedDB
    const db = await openDB();
    const posts = await getScheduledPosts(db);
    
    // Attempt to post them
    for (const post of posts) {
      try {
        await postToSocialMedia(post);
        await markPostAsPosted(db, post.id);
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync post:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed:', error);
  }
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BrandBibleDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getScheduledPosts(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['scheduledPosts'], 'readonly');
    const store = transaction.objectStore('scheduledPosts');
    const request = store.getAll();
    request.onsuccess = () => {
      const now = new Date();
      const duePosts = request.result.filter(post => 
        post.status === 'scheduled' && new Date(post.scheduledTime) <= now
      );
      resolve(duePosts);
    };
    request.onerror = () => reject(request.error);
  });
}

function markPostAsPosted(db, postId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['scheduledPosts'], 'readwrite');
    const store = transaction.objectStore('scheduledPosts');
    const request = store.get(postId);
    request.onsuccess = () => {
      const post = request.result;
      post.status = 'posted';
      store.put(post);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

async function postToSocialMedia(post) {
  // This would call the actual API
  const response = await fetch('/api/social-media/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  
  if (!response.ok) {
    throw new Error('Failed to post to social media');
  }
  
  return response.json();
}

// Push notifications for scheduled post reminders
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'BrandBible Notification';
  const options = {
    body: data.body || 'You have a scheduled post coming up!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.url,
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

console.log('[ServiceWorker] Loaded');
