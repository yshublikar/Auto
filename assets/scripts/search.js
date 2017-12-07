var cityModel;
$(document).ready(function() {

    setStoreNameToView(getStoreType());

    cityModel = JSON.parse(readCookie("cityName"));
    storeType = getStoreType();
    $('#city-search').val(cityModel.name);
    $('#cityId').val(cityModel._id);
    loadAllMakes(true);
    loadLatestExperiences();
    loadFeaturedExperience();
})

function getStoreType() {
    return JSON.parse(readCookie("cityName")) && JSON.parse(readCookie("cityName")).storeType !== null && JSON.parse(readCookie("cityName")).storeType !== undefined ? JSON.parse(readCookie("cityName")).storeType : ''
}

function getStoreTypeVanityUrl() {
    return JSON.parse(readCookie("cityName")) && JSON.parse(readCookie("cityName")).storeType !== null && JSON.parse(readCookie("cityName")).storeType !== undefined ? JSON.parse(readCookie("cityName")).storeType : 'dealership-workshop';
}

function loadFeaturedExperience() {



    var html = '<div class="container"><h3>Featured Experience</h3>';

    $.ajax({
        url: BASE_URL + "featuredExperiences/" + cityModel._id,
        method: 'GET', // 'POST'
        dataType: 'json',
        success: function(response, status) { // Succesfull response status
            var flag = false;
            var setClass = '';
            console.log("------ response featuredExperiences: ", response);
            if (response.docs && response.docs.length > 0) {

                $('#browse-bottom-hr').css('display', 'block');

                response.docs.forEach(function(element) {
                    if (element) {
                        flag = true;
                        html += '<div class="review-single clearfix">\
                                    <div class="logo-div"><a href="' + BASE_URL+ (changeToVanityurl(cityModel.name)) + '/' + element.experienceId.storeId.vanityUrl + '?store=' + element.experienceId.storeId.storeId + '"><img src="' + (BASE_URL + element.experienceId.storeId.logo) + '" onerror="this.src=\'' + BASE_URL + 'img/store-default-ico.png' + '\'" alt="" ></a></div>\
                                    <div class="cont-div">\
                                        <div class="head-area clearfix">\
                                            <div class="left">\
                                                <h5>' + element.experienceId.storeId.name + '</h5>\
                                                <span><i class="fa fa-map-marker" aria-hidden="true"></i> ' + element.experienceId.storeId.address + '</span>\
                                            </div>\
                                            <div class="right" id="fetureExperience">\
                                                    <span class="rating mtr-rating cust-mtr-rating">\
                                                    <ul class="mt-ratings">';
                        for (var i = 0; i < 5; i++) {
                            if (element.experienceId.posts[element.experienceId.posts.length - 1].rating > i) {
                                html += '<li class="active">\
                                                            <a href="javascript:;"><i class="fa fa-star" aria-hidden="true"></i></a></li>';
                            } else {
                                html += '<li class="">\
                                                            <a href="javascript:;"><i class="fa fa-star" aria-hidden="true"></i></a></li>';
                            }

                        }
                        html += '</ul></span> <span class="likes ' + element.experienceId.posts[element.experienceId.posts.length - 1]._id + 'featured">'

                        if ((data.userDetails && element.experienceId.posts.length > 0 && element.experienceId.posts[element.experienceId.posts.length - 1].likes.findIndex(x => x.like == data.userDetails._id) != -1)) {
                            setClass = 'active';
                        }

                        html += '<a href="javascript:;" class="' + setClass + '" \
                                onclick="likePost(\'' + "Post" + '\',\'' + (data.userDetails ? data.userDetails._id : '') + '\',\'' + element.experienceId._id + '\',\'' + element.experienceId.posts[element.experienceId.posts.length - 1]._id + '\',\'' + "likes" + '\',\'' + "featured" + '\')"><i class="fa fa-thumbs-up" aria-hidden="true"></i> Like (' + (element.experienceId && element.experienceId.posts[element.experienceId.posts.length - 1].likes.length) + ')</a></span>\</div>\
                                    </div>\
                                    <p class="linkify"><p class="exp-desc">' + element.experienceId.posts[element.experienceId.posts.length - 1].description + '\
                                        </p><a target="_blank" class="learn-more-link" href="' +(BASE_URL + changeToVanityurl(data.city && data.city.name || '-') + '/' + (element.experienceId.storeId && element.experienceId.storeId.vanityUrl || '-') +'/experiences/'+changeToVanityurl(element.experienceId.posts[0].title)+'?experience='+element.experienceId.experienceId)+ '">Read Details <i class="fa fa-angle-right" aria-hidden="true"></i>\
                                        </a>\
                                    </p>\
                                    <div class="user-details clearfix">\
                                        <span class="profile-img"><img src="' + (BASE_URL + (element.experienceId.userId && element.experienceId.userId.anonymous ? element.experienceId.userId.avatarImage : (element.experienceId.userId ? element.experienceId.userId.profileImage : ''))) + '" onerror="this.src=\'' + BASE_URL + 'img/user-demo.png\'" alt=""> <a class="text-hover-green" href="' + (BASE_URL + 'profile/' + (element.experienceId.userId && element.experienceId.userId.userId)) + '">' + (element.experienceId.userId && element.experienceId.userId.anonymous ? element.experienceId.userId.displayName : (element.experienceId.userId ? element.experienceId.userId.name : 'Unknown user')) + '</a></span>\
                                    </div>\
                                </div>\
                            </div>';
                        }
                });
                html += '</div>';

                if (flag) {
                    $('#review-main').addClass('review-main');
                    $('#review-main').html(html);
                }

            } else {
                if (data.experiences && data.experiences.length == 0) {
                    $('#browse-bottom-hr').css('display', 'none');
                }
            }
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

function loadLatestExperiences() {
    var html = '';

    data.experiences.forEach(function(element) {
        console.log("DAta latest experience", element);
        if (element.storeId != null || element.storeId != "") {
            html += '<!-- Start: Experience 01 -->\
        <div class="item">\
            <div class="experience-single">\
                <a href="#"><img class="logo-img" src="' + (BASE_URL + (element.storeId ? element.storeId.logo : '')) + '" alt=""></a>\
                <h5><a href="#">About ' + (element.storeId ? element.storeId.name : '') + '</a></h5>\
                <p>' + (element.posts && element.posts.length > 0 ? element.posts[element.posts.length - 1].title : '') + ' <a class="learn-more-link" href="' + BASE_URL + 'experience-details/' + element.experienceId + '">\
                    Read Details <i class="fa fa-angle-right" aria-hidden="true"></i>\
                    </a></p>\
                <div class="like-rate">\
                    <span class="rating"><a href="#"><img src="img/rate.jpg" alt=""></a></span>\
                    <span class="likes"><a href="#"><i class="fa fa-thumbs-up" aria-hidden="true"></i>Like </a></span>\
                </div>\
                <div class="user-details clearfix">\
                    <span class="profile-img"><img src="img/user.jpg" alt=""> Mike Ross</span>\
                </div>\
            </div>\
        </div>\
        <!-- End: Experience 01 -->';

        }
    })

    //$('#home-carousel').html(html);
}

function loadAllMakes(onlyFeatured) {

    if (data.makes) {
        var html = '';
        data.makes.forEach(function(element) {

            if (onlyFeatured) {
                if (element.offers && element.offers.length > 0) {
                    html += '<div class="col-md-2 logo-single">\
                        <a onclick="gotoStores(\'' + element.vanityUrl + '\')" href="javascript:;">\
                            <img class="cat-imgs" src="' + BASE_URL + ((element.logo)?element.logo:'img/make-default-ico.jpg') + '"\
                            onerror="this.src=\'' + BASE_URL + 'img/make-default-ico.jpg' + '\'" alt=""> <span>' + element.name + '</span>\
                        </a>\
                    </div>';
                }
            } else {
                html += '<div class="col-md-2 logo-single">\
                    <a onclick="gotoStores(\'' + element.vanityUrl + '\')" href="javascript:;">\
                        <img class="cat-imgs" src="' + BASE_URL + ((element.logo)?element.logo:'img/make-default-ico.jpg') + '"\
                        onerror="this.src=\'' + BASE_URL + 'img/make-default-ico.jpg' + '\'" alt=""> <span>' + element.name + '</span>\
                    </a>\
                </div>';
            }
        });
        $('#allMakes').html(html);
    }
}

function gotoStores(vanityUrl) {
    //window.location.href = BASE_URL +'stores/'+ vanityUrl +'/'+ getStoreTypeVanityUrl() +'/'+ changeToVanityurl(cityModel.name);
    window.location.href = BASE_URL  + changeToVanityurl(cityModel.name) + '/stores' + '?type=' + getStoreTypeVanityUrl() +'&make='+ vanityUrl;
}



// Set store type in session with city object---------
function chooseStoreType(storeType, element) {

    var obj = readCookie('cityName');
    console.log("--------- City Name:", obj)
    obj = JSON.parse(obj);

    if (getStoreType() === storeType) {
        objWithoutStoreType = {
            _id: obj._id,
            name: obj.name,
            cityId: obj.cityId
        }
        obj = objWithoutStoreType;

    } else if (getStoreType() === "" || getStoreType() === null || getStoreType() === undefined) {
        obj.storeType = storeType;
    } else if (getStoreType() === "dealership-workshop"){
        if (storeType == 'dealership') {
            obj.storeType = 'workshop';
        } else {
            obj.storeType = 'dealership';
        }
    } else {
        obj.storeType = 'dealership-workshop';
    }

    createSession('cityName', JSON.stringify(obj));
    setStoreNameToView(obj.storeType);

}

function setStoreNameToView(type) {
    if (type === 'dealership') {
        $("#dealerships").addClass('active');
        $("#workshops").removeClass('active');
    } else if (type === 'workshop') {
        $("#dealerships").removeClass('active');
        $("#workshops").addClass('active');
    } else if (type === 'dealership-workshop') {
        $("#dealerships").addClass('active');
        $("#workshops").addClass('active');
    } else {
        $("#dealerships").removeClass('active');
        $("#workshops").removeClass('active');
    }
}

function getAllStoresByMake(makeId) {
    if (makeId === undefined) {
        makeId = '59a7ef31184506eb267fd793';
    }
    console.log("--------- Get stores ajax call initiated.");

    $.ajax({
        url: BASE_URL + "getAllStoresByMake",
        method: 'POST', // 'POST'
        cache: false,
        dataType: 'json',
        data: { makeId: makeId },
        // headers: {},
        success: function(response, status) { // Succesfull response status

            console.log("------ response: ", response);
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

$('#city-search').keyup(function() {

    if (this.value && this.value != '') {
        //alert("in city search");
        $.ajax({
            url: BASE_URL + "getCities?q=" + this.value,
            method: 'GET', // 'POST'
            cache: false,
            dataType: 'json',
            data: {},
            headers: {},
            success: function(response) {
                console.log(response)
                var html = "";
                if (response.status === 'success') {
                    $('#city-result').html('');
                    if (response.docs.length > 0) {
                        console.log("in city change function");
                        $.each(response.docs, function(item) {
                            var data = "'" + response.docs[item].name + "','" + response.docs[item]._id + "','" + response.docs[item].cityId +"'";
                            var stateName=response.docs[item].state?(response.docs[item].state +', '):'';
                            var countryName=response.docs[item].country?response.docs[item].country:'';
                            html += '<li style="cursor: pointer;" onclick="selectCity(' + data + ')"><a><i class="pin-ico"></i>' + response.docs[item].name + '<span>' + stateName + countryName + '</span></a></li>';
                        })
                    } else {
                        console.log("in else function");
                        html += '<li style="cursor: pointer;" onclick="selectCity(' + ' ' + ')"><a><i class="pin-ico"></i><p class="m-t-8">Result not found</p> <span></span></a></li>';
                    }

                } else {
                    console.log("in outer else function");
                    html += '<li style="cursor: pointer;" onclick="selectCity(' + ' ' + ')"><a><i class="pin-ico"></i><p class="m-t-8">Result not found</p> <span></span></a></li>';
                }

                //console.log("html: ",html);
                // $( "#city-search" ).focus();
                if (!$(".serch-res-location").hasClass("active")) {

                    $(".serch-res-location").addClass("active");

                }
                $('#city-result').html(html)
            },
            error: function(error) {
                $('.first-step .error-main-mess').text(error.message)

            },
            beforeSend: function() {

            },
            complete: function() {
                // We can make status as processing done for forms and all.
            }
        })
    }
});


$('#store-search').keyup(function() {

    var contactUrl = BASE_URL + "contact#add-store";
    if (this.value && this.value != '') {



        $('.first-step .error-main-mess').css('display', 'none');
        if (!cityModel._id) {
            $('.first-step .error-main-mess').css('display', 'block');
            $('.first-step .error-main-mess').text("Please select city");
            return;
        }
        $.ajax({
            url: BASE_URL + "getStores/" + cityModel._id + "?q=" + this.value + "&type=" + getStoreTypeVanityUrl(),
            method: 'GET', // 'POST'
            cache: false,
            dataType: 'json',
            data: {},
            headers: {},
            success: function(response) {
                $('.serch-res-dealer').addClass('active');
                var html = "";
                if (response.status === 'success') {
                    $('#store-result').html('');
                    if (response.docs.length > 0) {
                        stores = response.docs;

                        $.each(response.docs, function(item) {

                            html += '<li style="cursor: pointer;" onclick="showStoreDetails(' + response.docs[item].storeId + ',\'' + response.docs[item].vanityUrl + '\')"><a><i class="' + ((response.docs[item].type).toLowerCase() === "dealership" ? "users-ico" : "car-ico") + '"></i>' + response.docs[item].name + '<span>' + response.docs[item].address + '</span></a></li>';
                        })
                    } else {

                        html += '<li style="cursor: pointer;"><a href="' + contactUrl + '"><i class="add-ico"></i> <span>Can`t find what you`re looking for?</span> Add a listing </a></li>';
                    }

                } else {

                    html += '<li style="cursor: pointer;"><a href="' + contactUrl + '"><i class="add-ico"></i> <span>Can`t find what you`re looking for?</span> Add a listing </a></li>';
                }

                $('#store-result').html(html)
            },
            error: function(error) {
                $('.second-step .error-main-mess').css('display', 'block');
                $('.second-step .error-main-mess').text(error.message)
            },
            beforeSend: function() {

            },
            complete: function() {
                // We can make status as processing done for forms and all.
            }
        })
    }
});



function showStoreDetails(id, vanityUrl) {
    if (vanityUrl === undefined) {
        vanityUrl = '-';
    }
    console.log("--------- Open store detials page: ", id);
    console.log("--------- city: ", cityModel);
    //window.location.href = BASE_URL + 'store/' + vanityUrl + '/' + changeToVanityurl(cityModel.name) + '/' + id;
    window.location.href = BASE_URL + changeToVanityurl(cityModel.name) + '/' + vanityUrl + '?store=' + id;
}

function selectCity(city, id, cityId) {
    if (city != '' && id && id != '') {
        cityModel.name = city;
        cityModel._id = id;
        cityModel.cityId = cityId;
        $('#city-search').val(city);
    } else {
        cityModel.name = undefined;
        cityModel._id = undefined;
        cityModel.cityId = undefined;
    }
}

function likePost(type, userId, expId, postId, action, elementId) {
    console.log("Type", type)
    console.log("expId", expId)
    console.log("Post id", postId)
    console.log("User id", userId)

    if (userId == undefined || userId == "") {
        facebookLogin();
        // window.location.reload();
    } else {
        $.ajax({
            url: BASE_URL + "LikeOrFlag/" + expId,
            method: 'PUT', // 'POST'
            cache: false,
            dataType: 'json',
            data: { "type": type, "postId": postId, "userId": userId, "commentId": '', "action": action },
            headers: {},
            success: function(response, status) { // Succesfull response status
                console.log("response", response)
                console.log("id", postId, elementId)
                if (response.action == "active") {
                    console.log("Element", $('#' + postId + elementId + ">a"))
                    $("." + postId + elementId + ">a").addClass('active');

                } else {
                    $('.' + postId + elementId + ">a").removeClass()
                }
                Setclass = response.action == "active" ? 'active' : '';
                html = '<a href="javascript:;" class="fb-btn ' + Setclass + '" data-toggle="tooltip"\
             data-placement="bottom" title="" data-original-title="Tooltip contents goes1 here"\
              onclick="likePost(\'' + type + '\',\'' + userId + '\',\'' + expId + '\',\'' + postId + '\',\'' + action + '\',\'' + elementId + '\')"><i class="fa fa-thumbs-up"\
               aria-hidden="true"></i>Like <span>(' + response.likes.length + ')</span></a>'


                $('.' + postId + elementId).html(html);
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

$('#searchForm').submit(function(event) {

    console.log("--------- cityModel._id: ", cityModel.cityId)

    $('#cityId').val('' + cityModel.cityId);
    $('#type').val(getStoreTypeVanityUrl());
    console.log('---------- Data: ', $('#searchForm').serialize());
    
    event.preventDefault();
    $('#searchForm').attr('action', BASE_URL + cityModel.name + '/stores');
    // $('#searchForm').submit();
    this.submit();

});