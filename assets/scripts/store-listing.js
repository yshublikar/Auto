$(document).ready(function() {

    var value;
    if (data.query && data.query.make) {
        value = data.query.make;
    }
    $('#select-tools').selectize({
        maxItems: null,
        valueField: '_id',
        labelField: 'name',
        searchField: 'name',
        closeAfterSelect: true,
        options: [value],
        load: function(values, callback) {
            if (values.length > 1) {
                /*Get makes*/
                console.log("--------- Get make ajax call initiated.");
                $.ajax({
                    url: BASE_URL + "getMakes?q=" + values,
                    method: 'GET', // 'POST'
                    cache: false,
                    dataType: 'json',
                    data: {},
                    headers: {},
                    success: function(response, status) { // Succesfull response status
                        console.log("------ response: ", response);
                        callback(response.docs)
                    },
                    error: function(error) {
                        // Error state of response
                        console.log("------ Error: ", error);
                        callback();
                    },
                    beforeSend: function() {
                        // We can make status as processing for forms and all.
                    },
                    complete: function() {
                        // We can make status as processing done for forms and all.
                    }
                })
            } else {
                console.log("length is less")
            }
        },
        onInitialize: function() {
            var selectize = this;
            //selectize.addOption(value);
            if (value) {
                selectize.setValue(value._id);
            }
        },

        onItemAdd: function(value, $item) {
            $('.selectize-input input').attr("placeholder", "Enter Make Name");
            $('.selectize-input input').width("119px")
        },
        onItemRemove(values) {
            $('.selectize-input input').attr("placeholder", "Enter Make Name");
            $('.selectize-input input').width("119px")
        },
        plugins: ['remove_button'],
    });

    //renderHtml(data);
    showActiveStores();
    loadMap();
    adjustComparePortion();

    //sorting data
    var value = $("#sortBy").val();
    sortingData(value);

})

function adjustComparePortion() {
    compare = [];
    sizePixels = 0;
    if (readCookie('storeCompare')) compare = JSON.parse(readCookie('storeCompare'));
    console.log("compare.length", compare.length);
    if (compare.length > 0) {
        $('.compare-button').css('display', 'block');
        sizePixels = ((160 * compare.length) + 2);

    } else {
        $('.compare-button').css('display', 'none');
    }

    if (compare.length <= 1) {
        $('#removeAll').css('display', 'none');
    } else {
        console.log("appply class....")
        $('#removeAll').css('display', 'inline-block');
    }

    $('.compare-items-cont').css('min-width', sizePixels + 'px');
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
        zoomControl: true,
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
    if (data.stores.length > 0) {
        addMarkers(data.stores);
    }

    /*var settings = {
      url: BASE_URL + "search?q=8000",
      method: "GET"
    }

    $.ajax(settings).done(function (response) {
        console.log("------ response: ",response);
        var markersData = response.docs;
        console.log("markers: ", markersData);

        addMarkers(markersData);

        
    });*/
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
                /* '<img class="side-img" src='+(BASE_URL+'img/cl-logo-03.jpg')+'>' +*/
                '<h6>' + markersData[i]["name"] + '</h6>' +
                '<p class="text-muted">' + markersData[i]["address"] + '</p>' + '</div>'
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
                    scrollTop: $("#scrollto_" + markersData[i]['_id']).offset().top - 64
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

function closeThis(storeId, el) {

    console.log("---- Name: ", storeId)

    var compare = [];
    if (readCookie('storeCompare')) compare = JSON.parse(readCookie('storeCompare'));

    if (compare.length > 0) {
        compare.splice(compare.indexOf(storeId), 1);
        createCookie('storeCompare', JSON.stringify(compare));
    }
    $(el).parent().parent().remove();
    $(".compare_" + storeId).toggleClass('active')
    $('.compareCount').html(compare.length);
    adjustComparePortion();
}

function removeAllCompare() {

    var compare = [];
    if (readCookie('storeCompare')) compare = JSON.parse(readCookie('storeCompare'));
    if (compare.length > 0) {
        compare.forEach(function(element) {
            $(".compare_" + element).toggleClass('active');
        })
    }
    eraseCookie('storeCompare');
    $("#compareStoresPortion").html('');
    $('.compareCount').html(0);
    adjustComparePortion();
}

function setStoreType(el) {
    if ($(el).hasClass('active')) {
        $(el).removeClass('active');
    } else {
        $(el).addClass('active');
    }
}

function showActiveStores() {
    var compare = [];
    if (readCookie('storeCompare')) compare = JSON.parse(readCookie('storeCompare'));
    console.log('------- compare: ', compare);

    makeComparableActive(compare);

    // Get all compare stores-------

    $.ajax({
        url: BASE_URL + "getStoresByIds",
        method: 'POST', // 'POST'
        cache: false,
        dataType: 'json',
        data: { storeIds: compare },
        headers: {},
        success: function(response, status) { // Succesfull response status

            compareHtml = '';
            console.log("---------- data: ", response);

            response.docs.forEach(function(store, indexStore) {
                if (compare.indexOf(store._id) > -1) {
                    compareHtml += '<li>' +
                        '<div class="itms-single">' +
                        '<a class="close-btn" href="javascript:;" name="' + store._id + '" onclick="closeThis(\'' + store._id + '\', this)">' +
                        '<img src="' + BASE_URL + 'img/close-ico.png" alt=""></a>' +
                        '<img src="' + BASE_URL + store.logo + '" onerror="this.src=\'' + BASE_URL + 'img/car-ico.png' + '\'" alt="">' +
                        '<p>' + store.name + '</p>' +
                        '</div>' +
                        '</li>';
                }
            })
            $('#compareStoresPortion').html(compareHtml);

            // Showing results in location---
            var location;
            if (readCookie('cityName')) location = JSON.parse(readCookie('cityName'));

            // if (location.name) {
            //     $('#showingResultsIn').html('in ' + location.name);
            // }

        },
        error: function(error) {
            // Error state of response
            console.log("------ Error: ", error);
        }
    })
}

function makeComparableActive(compare) {

    if (compare.length > 0) {
        compare.forEach(function(element, index) {
            // console.log(element);
            $('.compare_' + element).addClass('active');
        });
    }
    $('.compareCount').html(compare.length);
}

function applyFilters(offersOnly) {
    //get id of make from selectize option
    var $select = $('#select-tools').selectize();
    var selectize = $select[0].selectize;

    var makesId = $.map(selectize.items, function(value) {
        return value;
    });
    console.log("selectize", makesId)

    postData = {};
    var storeType = 'dealership-workshop';

    if ($('.dealership-selector.active').find('a').data('value') && $('.workshop-selector.active').find('a').data('value')) {
        storeType = 'dealership-workshop';
    } else if ($('.dealership-selector.active').find('a').data('value')) {
        storeType = 'dealership';
    } else if ($('.workshop-selector.active').find('a').data('value')) {
        storeType = 'workshop';
    } else {
        storeType = '';
    }

    postData = {
        make: makesId,
        city: { "id": data.query.cityId, "name": data.query.cityName },
        storeType: storeType,
        distanceRange: $("#km-slide").val(),
        overallRating: $("#overall-rating").val(),
        recommendationRate: $("#rate-slide").val(),
    }
    console.log("----------- Filters: ", postData);

    console.log("--------- Get cities ajax call initiated.");
    $.ajax({
        url: BASE_URL + "getFilteredStores",
        method: 'POST', // 'POST'
        cache: false,
        dataType: 'json',
        data: postData,
        success: function(response, status) { // Succesfull response status

            console.log("------ Response: ", response);
            data.stores = response.docs;
            data.query = response.query;

            var value = $('#checkbox-1').is(":checked");
            if (value) {
                sortByOffers(value);
            } else {
                var value = $("#sortBy").val(); // Date | Name | Type | Featured //
                sortingData(value);
            }


            /*html = '<span>Showing <span id="showingResults">' + (data.stores && data.stores.length > 0 ? '1' : '0') + '-' + data.stores.length + '</span>\
            </span> of <span id="resultTotal">' + data.query.storeCount + '</span> ' + data.query.storeType +
                ' in ' + data.query.cityName + '<span id="showingResultsIn"></span> &nbsp; &nbsp;<a class="add-filter-btn" href="#">Add Filter</a>';

            $('.filterleft-cont').html(html);*/
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

$(function() {
    var slider = new Slider("#km-slide", {
        ticks: [0, 20, 40, 60, 80, 100],
        ticks_labels: ['0', '20 km', '40 km', '60 km', '80 km', '100 km'],
        ticks_snap_bounds: 1,
        formatter: function(value) {
            return value + ' km';
        },
        value: 0,
    });
    $('#resetFilter').on('click', function() {
        slider.refresh();
    })

});

$(function() {
    var slider = new Slider("#rate-slide", {
        ticks: [0, 25, 50, 75, 100],
        ticks_labels: ['0', '25', '50', '75', '100'],
        ticks_snap_bounds: 1,
        value: 0,
    });
    $('#resetFilter').on('click', function() {
        slider.refresh();
    })
});

function reloadFilter() {
    //clear makes field
    var $select = $('#select-tools').selectize();
    var control = $select[0].selectize;
    control.clear(true);
    control.clearOptions();

    //clear stores
    $('.filterStoreType li').removeClass('active');

    //clear overall rating
    $('#overall-rating').barrating('clear');
}

$("#sortBy").on("selectmenuselect", function(event, ui) {

    var value = $("#sortBy").val(); // Date | Name | Type | Featured //
    sortingData(value);
});

function sortingData(value) {
    console.log("---------- sort by: ", value);
    console.log("---------- data before sort: ", data.stores);

    if (value == 'Date') {
        data.stores.sort(function(a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    } else if (value == 'Name') {
        data.stores.sort(function(a, b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
    } else if (value == 'Type') {
        data.stores.sort(function(a, b) {
            if (a.type < b.type)
                return -1;
            if (a.type > b.type)
                return 1;
            return 0;
        });
    } else if (value == 'Featured') {
        data.stores.sort(function(a, b) {

            return b.featured;
        });
    }
    console.log("---------- data after sort: ", data.stores);
    renderHtml(data);
}
var tempStorage = {};

function sortByOffers(offerdOnly) {
    var sortedData = [];

    if (offerdOnly == true) {
        tempStorage = JSON.parse(JSON.stringify(data));
        data.stores.forEach(function(item) {
            if ((item.makeId) && (item.makeId.offers) && (item.makeId.offers.length > 0)) {
                sortedData.push(item);
            }
        })
        data.stores = sortedData;
    } else if (offerdOnly == false) {
        data = tempStorage;
    }
    var value = $("#sortBy").val();
    sortingData(value);

}

function renderHtml(data) {

    var html = '';
    filterMsg = '<span>Showing <span id="showingResults">' + (data.stores && data.stores.length > 0 ? '1' : '0') + '-' + data.stores.length + '</span>\
            </span> of <span id="resultTotal">' + data.stores.length + '</span> ' + data.query.storeType +
        ' stores near ' + data.query.cityName + '<span id="showingResultsIn"></span> &nbsp; &nbsp;<a class="add-filter-btn" href="#">Add Filter</a>';

    $('.filterleft-cont').html(filterMsg);

    if (data.stores.length == 0) {
        $('#foundContainer').css('display', 'none');
        $('#notFoundContainer').css({'display':'block',"min-height": "500px"});
    } else {
        $('#foundContainer').css('display', 'block');
    }
    data.stores.forEach(function(element) {

        $('#notFoundContainer').css('display', 'none');
        $('#foundContainer').css('display', 'block');
        var imgName = 0;
        for (var j = 10; j <= Math.round(element.recommendedScore); j = j + 10) {
            imgName++;
            if (j < Math.round(element.recommendedScore) && Math.round(element.recommendedScore) < (j + 10)) {
                imgName++;
                break;
            }

        }
        var img = "";

        if (imgName > 0) {
            img = BASE_URL + "img/spedometer/meter_bar_small_" + (imgName < 3 ? 'red' : (imgName >= 3 && imgName < 7) ? 'yellow' : 'green') + "_" + imgName + ".png";
        } else {
            img = BASE_URL + "img/spedometer/meter_bar_small_0.png";

        }
        console.log("(element.phone ? element.phone : 'Not available')", element.phone)
        html += '<li id="scrollto_' + element._id + '">\
            <div class="store-list-single clearfix">\
                <div class="store-details clearfix">\
                    <div class="store-logo">\
                    <a class="text-color text-hover-green" \
                        href="' + BASE_URL + (changeToVanityurl(data.city && data.city.name ? data.city.name : '-')) + '/' + element.vanityUrl + '?store=' + element.storeId + '">\
                        <img src="' + BASE_URL + element.logo + '" alt="" onerror="this.src=\'' + BASE_URL + 'img/car-ico.png' + '\'"></a></div>\
                    <div class="store-cont">\
                        <span>' + (element.makeId ? (element.makeId.name + " " + element.type) : element.type) + '</span>\
                        <br>\<h6 class="compare-btn-new"><a class="text-color text-hover-green" \
                            href="' + BASE_URL + (changeToVanityurl(data.city && data.city.name ? data.city.name : '-')) + '/' + element.vanityUrl + '?store=' + element.storeId + '">\
                            ' + element.name + '</a> \
                            <span class="meeter compare_' + element._id + '"\
                                onclick="addToCompare(\'' + element._id + '\',this)">\
                                <img src="' + BASE_URL + 'img/meeter-ico.png" alt=""></span></h6>\
                        <span class="location">\
                            <i class="fa fa-map-marker" aria-hidden="true"></i>\
                            ' + element.address + '\
                        </span>\
                        <span class="phone">\
                            <i class="fa fa-phone" aria-hidden="true"></i>\
                            ' + (element.phone ? element.phone : 'Not available') + '\
                        </span>\
                    </div>\
                </div>\
                <div class="meeter-div">\
                    <div class="meter-all">\
                        <!-- Start: Meter Dial -->\
                        <div class="meter-main">\
                            <div class="meter-dial-pointer"></div>\
                            <img src="' + img + '" class="meter-dial" onerror="this.src="' + (BASE_URL + 'img/meter-bar-small.png') + '" alt="">\
                        </div>\
                        <!-- End: Meter Dial -->\
                        <div class="mtr-reccomented">\
                            <span>' + Math.round(element.recommendedScore || 0) + '<i> %</i></span>\
                            <u>recommended</u>\
                        </div>\
                        <div class="mtr-rating"><u>Rating</u>\
                            <ul class="mt-ratings">\
                                <li class="' + (Math.round(element.overallRating) >= 1 ? 'active' : '') + '">\
                                    <a href="#"><i class="fa fa-star" aria-hidden="true"></i></a></li>\
                                <li class="' + (Math.round(element.overallRating) >= 2 ? 'active' : '') + '">\
                                    <a href="#"><i class="fa fa-star" aria-hidden="true"></i></a></li>\
                                <li class="' + (Math.round(element.overallRating) >= 3 ? 'active' : '') + '">\
                                    <a href="#"><i class="fa fa-star" aria-hidden="true"></i></a></li>\
                                <li class="' + (Math.round(element.overallRating) >= 4 ? 'active' : '') + '">\
                                    <a href="#"><i class="fa fa-star" aria-hidden="true"></i></a></li>\
                                <li class="' + (Math.round(element.overallRating) >= 5 ? 'active' : '') + '">\
                                    <a href="#"><i class="fa fa-star" aria-hidden="true"></i></a></li>\
                            </ul>\
                        </div>\
                    </div>\
                </div>';
        if (element.makeId && element.makeId.offers.length > 0) {
            element.makeId.offers.forEach(function(offer) {
                html += '<div class="offer-cont">\
                            <a href="javascript:;">\
                                <span class="col-btn">Offer</span> ' + offer.title + '\
                            </a>\
                        </div>';
            })
        }
        html += '</div>\
        </li>';
    });

    $('#storeListAll').html(html);

    html = '';
    doneFeatured = false;

    data.stores.forEach(function(element) {

        if (data.city && data.city.featuredStores && data.city.featuredStores.length > 0) {
            data.city.featuredStores.forEach(function(subElement) {
                if (subElement.storeId === element._id && doneFeatured != true &&
                    (moment(subElement.from).format('L') <= moment().format('L') &&
                        moment(subElement.to).format('L') >= moment().format('L'))) {
                    $('.featured-store-all').css('display', 'block');
                    doneFeatured = true;
                    var imgName = 0;
                    for (var j = 10; j <= Math.round(element.recommendedScore); j = j + 10) {
                        imgName++;
                        if (j < Math.round(element.recommendedScore) && Math.round(element.recommendedScore) < (j + 10)) {
                            imgName++;
                            break;
                        }

                    }
                    var img = "";

                    if (imgName > 0) {
                        img = BASE_URL + "img/spedometer/meter_bar_small_" + (imgName < 3 ? 'red' : (imgName >= 3 && imgName < 7) ? 'yellow' : 'green') + "_" + imgName + ".png";
                    } else {
                        img = BASE_URL + "img/spedometer/meter_bar_small_0.png";

                    }
                    console.log("(element.phone ? element.phone : 'Not available')", element.phone)
                    html += '<li>\
                            <div class="store-list-single clearfix">\
                                <div class="featuredstore-tag">featured store</div>\
                                <div class="store-details clearfix">\
                                    <div class="store-logo">\
                                        <img src="' + BASE_URL + element.logo + '" alt="" onerror="this.src=\'' + BASE_URL + 'img/car-ico.png' + '\'"></div>\
                                    <div class="store-cont">\
                                        <span>' + (element.makeId ? (element.makeId.name + " " + element.type) : element.type) + '</span>\
                                        <br>\
                                        <h6 class="compare-btn-new"><a class="text-color text-hover-green" \
                                        href="' + BASE_URL + (changeToVanityurl(data.city && data.city.name ? data.city.name : '-')) + '/' + element.vanityUrl + '?store=' + element.storeId + '">\
                                        ' + element.name + '</a> \
                                            <span class="meeter compare_' + element._id + '"\
                                                onclick="addToCompare(\'' + element._id + '\',this)">\
                                                <img src="' + BASE_URL + 'img/meeter-ico.png" alt=""></span></h6>\
                                        <span class="location">\
                                        <i class="fa fa-map-marker" aria-hidden="true"></i>\
                                        ' + element.address + '\
                                    </span>\
                                        <span class="phone">\
                                        <i class="fa fa-phone" aria-hidden="true"></i>\
                                        ' + (element.phone ? element.phone : 'Not available') + '\
                                    </span>\
                                    </div>\
                                </div>\
                                <div class="meeter-div">\
                                    <div class="meter-all">\
                                        <!-- Start: Meter Dial -->\
                                        <div class="meter-main">\
                                            <div class="meter-dial-pointer"></div>\
                                            <img src="' + img + '" class="meter-dial" alt="">\
                                        </div>\
                                        <!-- End: Meter Dial -->\
                                        <div class="mtr-reccomented">\
                                        <span>' + Math.round(element.recommendedScore || 0) + '<i> %</i></span>\
                                            <u>recommended</u>\
                                        </div>\
                                        <div class="mtr-rating"><u>Rating</u>\
                                            <ul class="mt-ratings">\
                                                <li class="' + (Math.round(element.overallRating) >= 1 ? 'active' : '') + '">\
                                                    <a href="#"><i class="fa fa-star" aria-hidden="true"></i></a></li>\
                                                <li class="' + (Math.round(element.overallRating) >= 2 ? 'active' : '') + '">\
                                                    <a href="#"><i class="fa fa-star" aria-hidden="true"></i></a></li>\
                                                <li class="' + (Math.round(element.overallRating) >= 3 ? 'active' : '') + '">\
                                                    <a href="#"><i class="fa fa-star" aria-hidden="true"></i></a></li>\
                                                <li class="' + (Math.round(element.overallRating) >= 4 ? 'active' : '') + '">\
                                                    <a href="#"><i class="fa fa-star" aria-hidden="true"></i></a></li>\
                                                <li class="' + (Math.round(element.overallRating) >= 5 ? 'active' : '') + '">\
                                                    <a href="#"><i class="fa fa-star" aria-hidden="true"></i></a></li>\
                                            </ul>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </li>';
                }
            })
        }

        /*if (element.featured && doneFeatured != true && (moment(element.featuredFrom).format('L') <= moment().format('L') && moment(element.featuredTo).format('L') >= moment().format('L'))) {
            
        }*/
    })
    if (!doneFeatured) {
        $('.featured-store-all').css('display', 'none');
    }

    $('#storeFeatured').html(html);
    deleteMarkers();
    addMarkers(data.stores);
    // showMarkers()

    var compare = [];
    if (readCookie('storeCompare')) compare = JSON.parse(readCookie('storeCompare'));
    makeComparableActive(compare);
}

function addToCompare(storeId, el) {

    var compare = [];
    if (readCookie('storeCompare')) compare = JSON.parse(readCookie('storeCompare'));
    console.log('------- compare: ', compare);

    if (!$(el).hasClass("active") && compare.length >= 4) {
        alert('You only can add 4 items in compare.');
        return;
    }

    if ($(el).hasClass("active")) {

        if (compare.length > 0) {
            compare.splice(compare.indexOf(storeId), 1);
        }
    } else {
        if (compare.length > 0) {
            if (compare.indexOf(storeId) < 0) {
                compare.push(storeId);
            }
        } else {
            compare.push(storeId);
        }
    }


    createCookie('storeCompare', JSON.stringify(compare));
    $('.compareCount').html(compare.length);
    $('.compare_' + storeId).toggleClass('active');
    showActiveStores()
    adjustComparePortion();
}

function showOnHover(el) {
    console.log("-------- Hover");
    $(".compare-btn").addClass('active');
    $(".compare-items-cont").addClass('active');
}

function hideOnLeave(el) {
    $(".compare-btn").removeClass('active');
    $(".compare-items-cont").removeClass('active');
}

function goToCompare() {
    var compare = [];
    if (readCookie('storeCompare')) compare = JSON.parse(readCookie('storeCompare'));
    if (compare.length > 1) {
        window.location = BASE_URL + 'compare';
    } else {
        alert("There should be minimum two stores to compare.");
    }
}