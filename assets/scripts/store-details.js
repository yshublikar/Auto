$(document).ready(function() {
    if (readCookie('browsingUniqueUserId') == null) {
        createCookie('browsingUniqueUserId', (new Date().valueOf()) + '', 365);
    }
    addIdToVisits(readCookie('browsingUniqueUserId'));
})

function addIdToVisits(browsingUniqueUserId) {

    if (data.store.visitedCount.indexOf(browsingUniqueUserId) == -1) {
        $.ajax({
            url: BASE_URL + "trackStoreVisitCount/" + data.store._id + "/" + browsingUniqueUserId,
            method: 'GET', // 'POST'
            cache: false,
            dataType: 'json',
            success: function(response, status) { // Succesfull response status
                console.log(response.message);
            },
            error: function(error) {
                console.log("------ Error: ", error);
            }
        })
    } else {
        console.log("----------- Already visited.")
    }
}

function getOffer(makeId, offerId) {
    console.log("makeId", makeId);
    console.log("offerId", offerId);

    $.ajax({
        url: BASE_URL + "getOffer/" + makeId + "/" + offerId,
        method: 'GET', // 'POST'
        cache: false,
        dataType: 'json',
        data: {},
        headers: {},
        success: function(response) {
            console.log("response: ", response.offer);
            var offerName = response.offer.title;
            var offerDes = response.offer.fullDescription;
            var offerImage = BASE_URL + response.offer.image;
            var dummyImage = BASE_URL + "img/car-pop.jpg";
            //(offerName.length>50)?response.offer.title.slice(0,50)+"...":response.offer.title;
            //console.log("length of name: ",offerName.length);
            popupHtml = '';

            popupHtml += '<div id="offerImage">' + '<img src="' + offerImage + '" class="itm-img"  alt="" onerror="this.src=\'' + dummyImage + '\'" ></div>' +
                '<h5 id="offerName">' + offerName +
                '</h5>' +
                '<p id="offerDes">' + offerDes +
                '</p>';

            $('#load-content').html(" ");
            $('#load-content').html(popupHtml);
            if (!$(".offer-pop").hasClass("active")) {

                $(".offer-pop").addClass("active");

            }

        },
        error: function(error) {

            console.log(error);

        },
        beforeSend: function() {

        },
        complete: function() {
            // We can make status as processing done for forms and all.
        }
    })
}

// function gotoWriteExperience() {
//     if (!data.userDetails || !data.userDetails._id) {
//         // if (confirm('You first need to get login via facebook.')) {
//         facebookLogin();
//         // }
//     } else {
//         window.location.href = BASE_URL + 'create-experience/step2/' + data.store.storeId
//     }
// }

function addToCompare(storeId) {

    var compare = [];
    if (readCookie('storeCompare')) compare = JSON.parse(readCookie('storeCompare'));
    console.log('------- compare: ', compare);

    if (compare.indexOf(storeId) == -1) {
        compare.push(storeId);
        createCookie('storeCompare', JSON.stringify(compare));
    }
    window.location = BASE_URL + "compare";
}

function likePost(type, userId, expId, postId, action) {
    console.log("Type", type)
    console.log("expId", expId)
    console.log("Post id", postId)
    console.log("User id********", userId)

    if (userId == undefined || userId == "" || userId == "undefined") {
        facebookLogin();
    } else {
        $.ajax({
            url: BASE_URL + "LikeOrFlag/" + expId,
            method: 'PUT', // 'POST'
            cache: false,
            dataType: 'json',
            data: { "type": type, "postId": postId, "userId": userId, "commentId": '', "action": action },
            headers: {},
            success: function(response, status) { // Succesfull response status
                var Setclass = '';
                var html = '';
                Setclass = response.action == "active" ? 'active' : '';
                if (action == "likes") {
                    html = '<a href="javascript:;" class="fb-btn ' + Setclass + '" data-toggle="tooltip"\
             data-placement="bottom" title="" data-original-title="Tooltip contents goes1 here"\
              onclick="likePost(\'' + type + '\',\'' + userId + '\',\'' + expId + '\',\'' + postId + '\',\'' + action + '\')"><i class="fa fa-thumbs-up"\
               aria-hidden="true"></i>Like <span>(' + response.likes.length + ')</span></a>'

                }
                $('#' + postId).html(html);
            },
            error: function(error) {
                // Error state of response
                console.log("------ Error: ", error);
            },
            beforeSend: function() {
                // We can make status as processing for forms and all.
            },
            complete: function() {
                // We can make status as processing done for forms and all.
            }
        })
    }
}


/*---------- Start: Map ---------------*/

var markers = [];
var map;

function loadMap() {
    // Asynchronously Load the map API 

    /*var script = document.createElement('script');
    script.src = "//maps.googleapis.com/maps/api/js?key=AIzaSyBnFwrCdwnjyNrFuPV_IXP31CkcW_6hPjE&sensor=false&callback=initialize";
    document.body.appendChild(script);*/
}

function initialize() {

    var mapOptions = {
        mapTypeId: 'roadmap', // roadmap satellite hybrid terrain
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        styles: [{
                "elementType": "geometry",
                "stylers": [{
                    "color": "#F3F1F3"
                }]
            },
            {
                "elementType": "labels.icon",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#313131"
                }]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "color": "#ffffff"
                }]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#bdbdbd"
                }]
            },
            {
                "featureType": "poi",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#eeeeee"
                }]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#757575"
                }]
            },
            {
                "featureType": "poi.attraction",
                "elementType": "labels.text",
                "stylers": [{
                    "color": "#6991d1"
                }]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#e5e5e5"
                }]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#ffffff"
                }]
            },
            {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#757575"
                }]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#dadada"
                }]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#616161"
                }]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            },
            {
                "featureType": "transit",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#e5e5e5"
                }]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#eeeeee"
                }]
            },
            {
                "featureType": "water",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#c9c9c9"
                }]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            }
        ]
    };

    // Display a map on the page
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    map.setTilt(45);
    stores = [];
    console.log("------------- Store: ", data.store);
    if (data.store) {
        stores.push(data.store);
        addMarkers(stores);
    }
}

// Adds a marker to the map and push to the array.
function addMarkers(markersData) {
    // Info Window Content
    var infoWindowContent = [];
    var bounds = new google.maps.LatLngBounds();

    // Display multiple markers on a map
    var infoWindow = new google.maps.InfoWindow(),
        marker, i;

    for (i = 0; i < markersData.length; i++) {
        infoWindowContent.push({
            popup: '<div class="info_content">' +
                '<h3>' + markersData[i]["name"] + '</h3>' +
                '<p> This store is type of ' + markersData[i]["type"] + '</p>' + '</div>'
        })
    }

    // Loop through our array of markers & place each one on the map
    for (i = 0; i < markersData.length; i++) {
        var position = new google.maps.LatLng(markersData[i]['location']['coordinates'][0], markersData[i]['location']['coordinates'][1]);
        bounds.extend(position);
        var marker = new google.maps.Marker({
            position: position,
            map: map,
            storeId: markersData[i]['_id'],
            icon: markersData[i]['type'] == "Dealership" ? BASE_URL + 'img/dealer-ico-marker.png' : BASE_URL + 'img/workshop-ico-marker.png'
        });

        // Allow each marker to have an info window    
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                console.log('---------- Marker: ', marker);
                $('html, body').animate({
                    scrollTop: $("#scrollto_" + markersData[i]['_id']).offset().top
                }, 2000);

                infoWindow.setContent(infoWindowContent[i]['popup']);
                infoWindow.open(map, marker);
            }
        })(marker, i));

        markers.push(marker);
        // Automatically center the map fitting all markers on the screen
        map.fitBounds(bounds);
    }

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        this.setZoom(12);
        google.maps.event.removeListener(boundsListener);
    });
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}

/*---------- End: Map ---------------*/