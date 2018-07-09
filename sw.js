// define a cache variable for this project
var mwsRestaurantCache = 'mws-restaurant-stage-1';

/* add install event */
self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(mwsRestaurantCache).then(function(cache) {
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
				'/img/10.jpg'
			]);
		}));
});

// match incoming requests: if there is a cached entry, return it
self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);
});

// TODO check images and cache