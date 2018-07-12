/*eslint-disable no-undef*/
/*eslint-disable no-unused-vars*/

const myDatabase = 'restaurantsDatabase';
const myDatabaseObject = 'restaurantsObject';
/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Register and start the Service Worker
   */
  static startServiceWorker() {
    if (!navigator.serviceWorker) return;
    navigator.serviceWorker.register('sw.js')
      .then(function(r){
        console.log('Service Worker registered with scope ' + r.scope);
      }).catch(function(e){
        console.log('Registration failed with error ' + e);
      });
  }
  
  static myDebugger(data) {
    //debugger;
    console.log('in mydebugger' + data);
    //const restaurantList = document.querySelector('#restaurants-list');
    //restaurantList.insertAdjacentHTML('beforeend', `<p>x</p>`);
    //callback(null, data);
  }
  
  /**
   * Database URL
   */
  static get DATABASE_URL() {
    // server port and URL of the Local Development API Server
    const serverPort = 1337; // Change this to your server port
    const server = 'localhost';
    return `http://${server}:${serverPort}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   *
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
      .then(response => response.json())
      .then(restaurants => callback(null, restaurants))
      .catch(e => callback(e, null));
  }
  */

  static openDatabase() {
    if(!navigator.serviceWorker) {
      return Promise.resolve();
    }
    return idb.open(myDatabase, 1, function(upgradeDB) {
      var store = upgradeDB.createObjectStore(myDatabaseObject, {
        keyPath: 'id'
      });
      store.createIndex('by-id', 'id');
    });
  }

  /** 
  * Save data (i.e. restaurants) to the database 
  */ 
  static save(data) {
    return DBHelper.openDatabase().then(function(database){
      if (!database)
        return;

      var tx = database.transaction(myDatabaseObject, 'readwrite');
      var store = tx.objectStore(myDatabaseObject);
      data.forEach(function(restaurant){
        store.put(restaurant);
      });
      return tx.complete;
    });
  }

  /*
  * Fetch and save data to database
  */
  static fetchRestaurantsFromDatabase(){
    return fetch(DBHelper.DATABASE_URL)
      .then(function(response){
        return response.json();
      }).then(restaurants => {
        DBHelper.save(restaurants);
        return restaurants;
      });
  }

  /*
  * Get data from database
  */
  static getRestaurantsFromCache() {
    return DBHelper.openDatabase().then(function(database){
      if(!database)
        return;
      var store = database.transaction(myDatabaseObject).objectStore(myDatabaseObject);
      return store.getAll();
    });
  }

  /**
   * Fetch all restaurants
   */
  static fetchRestaurants(callback) {
    return DBHelper.getRestaurantsFromCache().then(restaurants => {
      if(restaurants.length) {
        return Promise.resolve(restaurants);
      } else {
        return DBHelper.fetchRestaurantsFromDatabase();
      }
    }).then(restaurants=> {
      callback(null, restaurants);
    }).catch(error => {
      callback(error, null);
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurantPromise) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurantPromise;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
      // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    // TODO use large/small images to optimize 

    // if underfined, return placeholder image
    if (restaurant.photograph === undefined) {
      // assign name of the placeholder image (no_image_available.svg)
      return '/img/no_image_available.svg';
    }
    else
      return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      });
    marker.addTo(newMap);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}
/*eslint-enable no-undef*/
/*eslint-enable no-unused-vars*/