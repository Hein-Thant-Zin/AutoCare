const CACHE_NAME = 'autocare-v2'
const STATIC_ASSETS = [
  '/manifest.json',
]

// Routes that must NEVER be intercepted by the service worker
const BYPASS_PATTERNS = [
  '/api/',
  '/login',
  '/admin',
  '/_next/',
  '/auth',
]

function shouldBypass(url) {
  const { pathname } = new URL(url)
  return BYPASS_PATTERNS.some((p) => pathname.startsWith(p))
}

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: bypass all auth/API/navigation — only cache static assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET from same origin
  if (request.method !== 'GET' || url.origin !== location.origin) return

  // Bypass auth, API, and navigation routes entirely — let browser handle them
  if (shouldBypass(request.url)) return

  // For navigation requests (HTML pages) — always go to network
  if (request.mode === 'navigate') return

  // Static assets only: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})
