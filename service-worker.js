/**
 * Service Worker for MBTI Quiz PWA
 * Кэширует все ресурсы для офлайн-работы
 */

const CACHE_NAME = 'mbti-quiz-v1';
const ASSETS_TO_CACHE = [
  '/mbti-quiz-pwa/',
  '/mbti-quiz-pwa/index.html',
  '/mbti-quiz-pwa/css/style.css',
  '/mbti-quiz-pwa/js/app.js',
  '/mbti-quiz-pwa/js/scoring.js',
  '/mbti-quiz-pwa/js/storage.js',
  '/mbti-quiz-pwa/data/questions.json',
  '/mbti-quiz-pwa/icons/icon-192x192.png',
  '/mbti-quiz-pwa/icons/icon-512x512.png',
  '/mbti-quiz-pwa/manifest.json'
];

// Установка - кэшируем все ресурсы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация - удаляем старые кэши
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Запрос - сначала кэш, потом сеть
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Есть в кэше - возвращаем
        if (response) {
          return response;
        }
        
        // Нет в кэше - запрашиваем с сети
        return fetch(event.request).then((response) => {
          // Не валидный ответ или не GET - не кэшируем
          if (!response || response.status !== 200 || event.request.method !== 'GET') {
            return response;
          }
          
          // Клонируем ответ для кэширования
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Офлайн - показываем заглушку
        if (event.request.destination === 'document') {
          return caches.match('/mbti-quiz-pwa/index.html');
        }
      })
  );
});
