mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    style: 'mapbox://styles/mapbox/satellite-streets-v12', // style URL
    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 10 // starting zoom
});

// console.log(coordinates);

const marker = new mapboxgl.Marker( { color: 'red'} )
        .setLngLat(listing.geometry.coordinates) //Listing.geometry.coordinates
        .setPopup(new mapboxgl.Popup({offset: 25})
        .setHTML(`<h4>${listing.location}</h4>`))
        .addTo(map);