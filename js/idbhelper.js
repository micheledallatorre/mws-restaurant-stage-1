const DB_NAME = 'restaurantsDB';
const DB_VERSION = 1;
const DB_OBJECT = 'restaurants';

const SERVER = 'localhost';
const PORT = '1337';
const URL_RESTAURANT_DATABASE = `http://${SERVER}:${PORT}/restaurants`;
const URL_REVIEWS_BY_RESTAURANT_ID = `http://${SERVER}:${PORT}/reviews/?restaurant_id=`;
const URL_REVIEWS_DATABASE = `http://${SERVER}:${PORT}/reviews/`;

/**
 * Common idb helper functions
 */
/*eslint-disable no-unused-vars*/
class IDBHelper {

  /**
  * Get database promise
  */
  static get dbPromise() {
    if (!('indexedDB' in window)) {
      console.log('This browser does not support IndexedDB');
      return 0;
    }
    /*eslint-disable no-undef*/
    // open database
    const dbPromise = idb.open(DB_NAME, DB_VERSION);
    /*eslint-enable no-undef*/
    return dbPromise;
  }

  /**
   * Check if IDB database exists
   */
  static checkIfDatabaseExists(dbname = DB_NAME, callback) {
    var request = indexedDB.open(dbname);
    var existed = true;
    request.onsuccess = function () {
      request.result.close();
      if (!existed)
        indexedDB.deleteDatabase(dbname);
      callback(existed);
    };
    request.onupgradeneeded = function () {
      existed = false;
    };
  }

  /**
   * Delete IDB database
   */
  static deleteDatabase() {
    let deleteRequest = window.indexedDB.deleteDatabase(DB_NAME);
    deleteRequest.onerror = function () {
      console.log('ERROR! Cannot delete database ' + DB_NAME);
    };
    deleteRequest.onsuccess = function () {
      console.log('Database correctly deleted!');
    };
  }

  /**
   * Create IDB database
   */
  static createDatabase() {
    /*eslint-disable no-undef*/
    idb.open(DB_NAME, DB_VERSION, function (upgradeDb) {
    /*eslint-enable no-undef*/
      if (!upgradeDb.objectStoreNames.contains(DB_OBJECT)) {
        upgradeDb.createObjectStore(DB_OBJECT, {keypath: 'id', autoIncrement: true});
      }
      console.log(DB_NAME + ' correctly created!');
    });
  }

  /**
   * Fill database with data
   */
  static fillDatabase(dbPromise) {
    /*eslint-disable no-undef*/
    fetch(URL_RESTAURANT_DATABASE)
    /*eslint-enable no-undef*/
      .then(res => res.json())
      .then(json => {
        json.map(restaurant => IDBHelper.addRestaurantReviews(restaurant, dbPromise));
      })
      .catch(err => console.log('Error in reading resturant database: ' + err));
  }

  /**
   * Add restaurant reviews to the database
   */
  static addRestaurantReviews(restaurant, dbPromise) {
    fetch(URL_REVIEWS_BY_RESTAURANT_ID + restaurant.id)
      .then(res => res.json())
      .then(reviews => dbPromise.then(
        db => {
          const tx = db.transaction(DB_OBJECT, 'readwrite');
          const store = tx.objectStore(DB_OBJECT);
          let my_restaurant = restaurant;
          my_restaurant.reviews = reviews;
          store.put(my_restaurant);
          tx.complete;
        })
      )
      .catch(err => console.log('Error in reading restaurant reviews: ' + err));
  }

  /**
   * Get all data from resturant datbase
   */
  static getData(dbPromise) {
    return dbPromise.then(db => {
      return db.transaction(DB_OBJECT)
        .objectStore(DB_OBJECT).getAll();
    });
  }

  /**
   * Update resturant favorite field in restaurant database
   */
  static toggleRestaurantFavorite(id, value) {
    let myID = parseInt(id);
    let is_favorite = String(value);

    IDBHelper.dbPromise.then(db => {
      //console.log(`Dbpromise: ${dbPromise}`);
      const tx = db.transaction(DB_OBJECT, 'readwrite');
      const objStore = tx.objectStore(DB_OBJECT);
      let val = objStore.get(myID).then(function(response) {
        response.is_favorite = String(value);
        console.log(`in toggleRestaurantFavorite, response_isFav: ${response.is_favorite} id: ${id}, reponse: ${response}`);
        objStore.put(response, myID);
        return tx.complete;
      }, function(error) {
        console.error("Failed addReview!", error);
      });
    });
  }

  /**
   * Add a restaurant review into restaurant databasese
   */
  static addReview(id, body) {
    let key = parseInt(id);
    IDBHelper.dbPromise.then(db => {
      const tx = db.transaction(DB_OBJECT, 'readwrite');
      const objStore = tx.objectStore(DB_OBJECT);
      let val = objStore.get(key).then(function(response) {
        console.log(`in addReview, response: ${response}, reviews ${response.reviews}, id: ${id}, reviewBody: ${body}`);
        response.reviews.push(body);
        objStore.put(response, key);
        return tx.complete;
      }, function(error) {
        console.error("Failed addReview!", error);
      });
    });
  }

  /**
   * Update restaurant database by getting and saving reviews into the restaurant database
   */
  static getAndSaveReviews() {
    console.log('In getAndSaveReviews');
    // get all data from the database
    IDBHelper.getData(IDBHelper.dbPromise)
      .then(data => {
        let reviewsToAdd = [];
        data.forEach(item => {
          item.reviews.forEach(review => {
            if (review.flag) {
              reviewsToAdd.push(review);
              delete review.flag;
            }
          });
        });
        reviewsToAdd.forEach(item => {
          const body = {
            'restaurant_id': item.restaurant_id,
            'name': item.name,
            'rating': item.rating,
            'comments': item.comments,
            'updatedAt': item.updatedAt,
          };
          fetch(URL_REVIEWS_DATABASE, {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
          }).then(res => console.log('Successfully saved all reviews', res.json()));
        });
      });
  }
}