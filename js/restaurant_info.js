/*eslint-env es6*/
/*eslint-disable no-undef*/
/*eslint-disable no-unused-vars*/
let restaurant;
var newMap;

/* Start Service Worker on page load and map */
document.addEventListener('DOMContentLoaded', (event) => {
  DBHelper.startServiceWorker();
  // display map
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoibWR0IiwiYSI6ImNqamliMjF3YjBscGYzcXJscWt3aHFzbGwifQ.-Ka2k-9rBS74eE6LYdeDXw',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};  

//Initialize Google map, called from HTML.
/*window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}*/

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.tabIndex = '0';

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.tabIndex= '0';

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.setAttribute('alt','Picture of restaurant {restaurant.name}');
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  cuisine.tabIndex= '0';

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();

  // display review form
  createReviewFormHTML();

  // fill favorite HTML element
  fillRestaurantFavoriteHTML();
};


/**
 * Create restaurant add or remove favorite
 */
fillRestaurantFavoriteHTML = (id = self.restaurant.id, is_favorite = self.restaurant.is_favorite) => {
  const favoriteElem = document.getElementById('restaurant-favorite');
  console.log(self.restaurant);

  let favButton = document.createElement('button');
  favButton.setAttribute('id', 'favorite-button');

  if (is_favorite == 'true') {
    favButton.innerHTML = 'Remove from favorite';
    favButton.setAttribute('onclick',`DBHelper.toggleFavorite(${id}, false);`);
  } else {
    favButton.innerHTML = 'Add to favorite';
    favButton.setAttribute('onclick',`DBHelper.toggleFavorite(${id}, true);`);
  }

  favoriteElem.appendChild(favButton);
};


/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.tabIndex= '0';
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.tabIndex= '0';
    row.appendChild(time);

    hours.appendChild(row);
    hours.tabIndex= '0';
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  title.tabIndex= '0';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.tabIndex= '0';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  console.log('Review', review);
  const li = document.createElement('li');

  const date = document.createElement('p');
  var createdDate = new Date(review.createdAt * 1000);
  date.innerHTML = createdDate;
  date.className = 'review-date';
  date.tabIndex= '0';
  li.appendChild(date);

  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'review-author';
  name.tabIndex= '0';
  li.appendChild(name);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'review-rating';
  rating.tabIndex= '0';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'review-comment';
  comments.tabIndex= '0';
  li.appendChild(comments);

  return li;
};

/**
 * Create HTML review form
 */
createReviewFormHTML = (id = self.restaurant.id) => {
  const formElement = document.getElementById('review-form');

  const myForm = document.createElement('form');
  myForm.setAttribute('id', 'restaurantReviewForm');
  myForm.setAttribute('onsubmit', 'DBHelper.saveReviewOffline(event, this);');

  const title = document.createElement('h2');
  title.innerHTML = 'Restaurant Review Form ';
  myForm.appendChild(title);

  const restaurantId = document.createElement('input');
  restaurantId.setAttribute('type', 'hidden');
  restaurantId.setAttribute('name', 'id');
  restaurantId.setAttribute('value', `${id}`);
  myForm.appendChild(restaurantId);

  const reviewUpdatedDate = document.createElement('input');
  unixTime = Math.round(Date.now());
  reviewUpdatedDate.setAttribute('type', 'hidden');
  reviewUpdatedDate.setAttribute('name', 'updatedDate');
  reviewUpdatedDate.setAttribute('value', `${unixTime}`);
  myForm.appendChild(reviewUpdatedDate);

  const reviewSyncFlag = document.createElement('input');
  reviewSyncFlag.setAttribute('type', 'hidden');
  reviewSyncFlag.setAttribute('name', 'syncFlag');
  reviewSyncFlag.setAttribute('value', 'unsynced');
  myForm.appendChild(reviewSyncFlag);

  const reviewerLabel = document.createElement('label');
  reviewerLabel.innerHTML = 'Your Name: ';
  myForm.appendChild(reviewerLabel);

  const reviewerInputElem = document.createElement('input');
  reviewerInputElem.setAttribute('type', 'text');
  reviewerInputElem.setAttribute('name', 'reviewerName');
  reviewerInputElem.setAttribute('placeholder', 'Please enter your name here!');
  reviewerInputElem.setAttribute('aria-label', 'Name of the reviewer');
  myForm.appendChild(reviewerInputElem);

  const line = document.createElement('br');
  myForm.appendChild(line);

  const ratingLabel = document.createElement('label');
  ratingLabel.innerHTML = 'Your Rating: ';
  myForm.appendChild(ratingLabel);

  const ratingInputElem = document.createElement('input');
  ratingInputElem.setAttribute('type', 'text');
  ratingInputElem.setAttribute('name', 'reviewerRating');
  ratingInputElem.setAttribute('placeholder', '1 < your rating < 5');
  ratingInputElem.setAttribute('aria-label', 'restaurant rating');
  myForm.appendChild(ratingInputElem);

  const line2 = document.createElement('br');
  myForm.appendChild(line2);

  const reviewLabel = document.createElement('label');
  reviewLabel.innerHTML = 'Your Review: ';
  myForm.appendChild(reviewLabel);

  const rewiewTextareaElem = document.createElement('textarea');
  rewiewTextareaElem.setAttribute('name', 'reviewText');
  rewiewTextareaElem.setAttribute('placeholder', 'Write here your comments!');
  rewiewTextareaElem.setAttribute('aria-label', 'restaurant review');
  myForm.appendChild(rewiewTextareaElem);

  const line3 = document.createElement('br');
  myForm.appendChild(line3);

  const submitButton = document.createElement('input');
  submitButton.setAttribute('type', 'submit');
  submitButton.setAttribute('name', 'dsubmit');
  submitButton.setAttribute('value', 'Submit');
  myForm.appendChild(submitButton);

  formElement.appendChild(myForm);
};



/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  /*eslint-disable no-useless-escape*/  
  name = name.replace(/[\[\]]/g, '\\$&');
  /*eslint-enable no-useless-escape*/  
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
/*eslint-enable no-undef*/
/*eslint-enable no-unused-vars*/
