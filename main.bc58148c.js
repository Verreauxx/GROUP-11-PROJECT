var search = document.getElementById("myBtn")
var searchbar = document.querySelector("type")

let pos;
let map;
let bounds;
let infoWindow;
let currentInfoWindow;
let service;
let infoPane;
function initMap() {
  console.log ("initMap")
  bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow;
  currentInfoWindow = infoWindow;
  infoPane = document.getElementById('panel');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 15
      });
      bounds.extend(pos);

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);

      getNearbyPlaces(pos);
    }, () => {
      handleLocationError(true, infoWindow);
    });
  } else {
    handleLocationError(false, infoWindow);
  }
}

function handleLocationError(browserHasGeolocation, infoWindow) {
  pos = { lat: 47.6062, lng: -122.3321 };
  map = new google.maps.Map(document.getElementById('map'), {
    center: pos,
    zoom: 8
  });

  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation)
  infoWindow.open(map);
  currentInfoWindow = infoWindow;

  getNearbyPlaces(pos);
}

function getNearbyPlaces(position) {
  var food = searchbar.value
  console.log (food)
  let request = {
    location: position,
    rankBy: google.maps.places.RankBy.DISTANCE,
    keyword: food
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, nearbyCallback);
}

var search = document.getElementById("pac-input");
search.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("myBtn").click();
  }
});

function nearbyCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    createMarkers(results);
  }
}

function createMarkers(places) {
  places.forEach(place => {
    let marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name
    });

    google.maps.event.addListener(marker, 'click', () => {
      let request = {
        placeId: place.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'rating',
          'website', 'photos']
      };

      service.getDetails(request, (placeResult, status) => {
        showDetails(placeResult, marker, status)
      });
    });

    bounds.extend(place.geometry.location);
  });

  map.fitBounds(bounds);
}

function showDetails(placeResult, marker, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    let placeInfowindow = new google.maps.InfoWindow();
    let rating = "None";
    if (placeResult.rating) rating = placeResult.rating;
    placeInfowindow.setContent('<div><strong>' + placeResult.name +
      '</strong><br>' + 'Rating: ' + rating + '</div>');
    placeInfowindow.open(marker.map, marker);
    currentInfoWindow.close();
    currentInfoWindow = placeInfowindow;
    showPanel(placeResult);
  } else {
    console.log('showDetails failed: ' + status);
  }
}

function showPanel(placeResult) {
  if (infoPane.classList.contains("open")) {
    infoPane.classList.remove("open");
  }

  while (infoPane.lastChild) {
    infoPane.removeChild(infoPane.lastChild);
  }

  if (placeResult.photos) {
    let firstPhoto = placeResult.photos[0];
    let photo = document.createElement('img');
    photo.classList.add('hero');
    photo.src = firstPhoto.getUrl();
    infoPane.appendChild(photo);
  }

  let name = document.createElement('h1');
  name.classList.add('place');
  name.textContent = placeResult.name;
  infoPane.appendChild(name);
  if (placeResult.rating) {
    let rating = document.createElement('p');
    rating.classList.add('details');
    rating.textContent = `Rating: ${placeResult.rating} \u272e`;
    infoPane.appendChild(rating);
  }
  let address = document.createElement('p');
  address.classList.add('details');
  address.textContent = placeResult.formatted_address;
  infoPane.appendChild(address);
  if (placeResult.website) {
    let websitePara = document.createElement('p');
    let websiteLink = document.createElement('a');
    let websiteUrl = document.createTextNode(placeResult.website);
    websiteLink.appendChild(websiteUrl);
    websiteLink.title = placeResult.website;
    websiteLink.href = placeResult.website;
    websitePara.appendChild(websiteLink);
    infoPane.appendChild(websitePara);
  }

  infoPane.classList.add("open");
}