// define a cache variable for this project
var mwsRestaurantCache = 'mws-restaurant-stage-1';

/* add install event and cache all the application static files */
self.addEventListener('install', function(event) {
  console.log('Installing Service Worker...');
  event.waitUntil(
    caches.open(mwsRestaurantCache).then(function(cache) {
      console.log('Service Worker caching application files...');
      // cache all resources
      return cache.addAll([
        '/index.html',
        '/restaurant.html',
        '/sw.js',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/idb.js',
        '/js/restaurant_info.js',
        '/css/styles.css',
        '/css/responsive.css',
        '/img/no_image_available.svg',
        '/img/1.jpg',
        '/img/2.jpg',
        '/img/3.jpg',
        '/img/4.jpg',
        '/img/5.jpg',
        '/img/6.jpg',
        '/img/7.jpg',
        '/img/8.jpg',
        '/img/9.jpg',
        '/img/10.jpg',
        '/img/icons/layers.png',
        '/img/icons/layers-2x.png',
        '/img/icons/marker-icon.png',
        '/img/icons/marker-icon-2x.png',
        '/img/icons/marker-shadow.png'
      ]);
    }));
});

// Service worker activation
self.addEventListener('activate', function(event) {
  console.log('Service worker activation...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      /*eslint-disable no-undef*/
      return Promise.all(
        /*eslint-enable no-undef*/
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('mws-') && cacheName != mwsRestaurantCache;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      ).then(() => { 
        console.log('Service worker activated');
      });
    })
  );
});

// match incoming requests: if there is a cached entry, return it
self.addEventListener('fetch', function(event) {
  event.respondWith(getDataFromCache(event.request).catch((error) => {
    console.log(error);
  }));
  event.waitUntil(update(event.request));
});

// update cache with the request
function update(request) {
  return caches.open(mwsRestaurantCache).then(function(cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}

// get request from cache, if present
function getDataFromCache(request) {
  return caches.open(mwsRestaurantCache).then(function(cache) {
    return cache.match(request).then(function (matching) {
      return matching || fetch(request);
    });
  });
}

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});