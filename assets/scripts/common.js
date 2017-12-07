function demo() {
    console.log("test demo....");
};

function reload() {
    location.reload();
}

function changeToVanityurl(input) {
    return (input).toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-")
}

function getCities() {

    console.log("--------- Get cities called.");
    var query = $("#searchCityInput").val();
    if (query.length > 1) {
        console.log("--------- Get cities ajax call initiated.");
        $.ajax({
            url: BASE_URL + "getCities?q=" + query,
            method: 'GET', // 'POST'
            cache: false,
            dataType: 'json',
            data: {},
            headers: {},
            success: function(response, status) { // Succesfull response status

                console.log("------ response: ", response);
                if (response.docs.length > 0) {

                    var html = '';
                    response.docs.forEach(function(entry) {

                        console.log('entry: ', entry);

                        var _id = "'" + entry._id + "'";
                        var cityName = "'" + entry.name + "'";
                        html += '<li><a href="javascript:;" onclick="addCityInCookie(' + _id + ',' + cityName + ',\'' + entry.cityId + '\')">' + entry.name + '</a></li>';
                        // html += "<li><a href='" + BASE_URL + "?selectedCity=" + entry + "' >" + entry.name + "</a></li>";

                    });

                    $("#searchResultTop").html(html);
                } else {
                    $("#searchResultTop").html('<li><a href="#">Unable to find your place</a></li>');
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
    } else {

        $("#searchResultTop").html('<li><a>Type minimum two characters to find</a></li>');
    }
}




// Set city object in session ---------
function addCityInCookie(_id, cityName, cityId) {
    var obj = {
        _id: _id,
        name: cityName,
        cityId: cityId
    }
    var obj = JSON.stringify(obj);
    console.log("obj: ", obj)

    createSession('cityName', obj, true);
    $(".place-togle").removeClass('active');
    $(".search-top-used").removeClass('active');
    // location.reload();
    setCityNameToView();
}


/*---------------- Start: Cookies ------------------------*/

function createCookie(name, value, days) {
    if (days === undefined) days = 5;
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function createSession(name, value, reload, days) {
    if (reload === undefined) reload = false;
    if (days === undefined) days = 5;
    $.ajax({
        url: BASE_URL + "setCity",
        method: 'POST', // 'POST'
        cache: false,
        dataType: 'json',
        data: { cityModel: JSON.parse(value) },
        headers: {},
        success: function(response, status) { // Succesfull response status
            if (response.status === "success") {

                var expires = "";
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date.toUTCString();
                }
                document.cookie = name + "=" + value + expires + "; path=/";

                if (reload) window.location.reload();
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

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

/*
$( document ).ready(function() {
    console.log( "ready!" );
    console.log("--------- Creating cookies.");
    createCookie('myCookies','this is my cookies new data', 1);
    console.log("--------- Reading cookies.");
    console.log(readCookie('myCookies'));
});
*/
/*---------------- End: Cookies ------------------------*/

$(document).ready(function() {

    console.log("--------- Ready!")
    console.log("--------- Reading cookies.")

    $('.linkify').linkify();

    setCityNameToView();
    $('#overlayDivSelection').addClass((data.city && data.city.name) || (data.page == '404page') ? '' : 'overlay-div')

    // scroll to top when city is not there in the session -------
    if (!(data.city && data.city.name)) {
        setTimeout(function() {
            $("html, body").animate({ scrollTop: 0 }, "slow");
        }, 1000);
    }

})

function setCityNameToView() {
    var city = readCookie('cityName');
    console.log("--------- City Name:", city)
    city = JSON.parse(city);
    console.log("--------- City Name:", city)

    if (city !== null) {
        $("#myPlace").html(city.name);
    } else {
        $("#myPlace").html('SELECT YOUR PLACE');
    }
}

//Facebook Login
function getStatus() {
    if (data.city && data.city.name) {
        html = '<a href="javascript:;" class="clearfix"><img class="top-icos" src="' + BASE_URL + 'img/fb-ico.png" alt=""><span class="login-fb">Loading.....</span></a>';
        $('#login-fb').html(html);
        window.FB.getLoginStatus(function(response) {
            if (response.status == 'connected') {
                console.log("user is logged in to app");
                userInformation(response.authResponse.accessToken);
            } else if (response.status == 'not_authorized') {
                console.log("user is logged in to to FB but not to app");
                facebookLogin();
            } else if (response.status == 'unknown') {
                facebookLogin();
            }
        });
    } else {
        alert("Please select your city first.");
    }
}

function facebookLogin(callback) {
    html = '<a href="javascript:;" class="clearfix"><img class="top-icos" src="' + BASE_URL + 'img/fb-ico.png" alt=""><span class="login-fb">Loading.....</span></a>';
    $('#login-fb').html(html);
    console.log("facebookLogin")
    window.FB.login(function(response) {
        if (response.authResponse) {
            userInformation(response.authResponse.accessToken, function(data) {
                callback(data);
            });
        }
        console.log("login response", response)
    }, { scope: 'email' });
}

function userInformation(token, callback) {
    var userData = {};
    window.FB.api('/me?fields=id,name,birthday,email', 'get', { access_token: token }, function(userDetails) {
        userData.facebookId = userDetails.id;
        userData.name = userDetails.name;
        userData.email = userDetails.email;

        window.FB.api('/me/picture?width=180&height=180', function(userProfile) {
            userData.profileImage = userProfile.data.url;
            console.log("user Data", userData)

            $.ajax({
                url: BASE_URL + "login",
                method: 'POST', // 'POST'
                cache: false,
                dataType: 'json',
                data: userData,
                headers: {},
                success: function(response, status) { // Succesfull response status
                    window.location.reload();
                    console.log("------ response: ", response);
                    // callback(response);
                },
                error: function(error) {
                    // Error state of response
                    console.log("------ Error: ", error);
                    if (error.responseJSON.message) {
                        alert(error.responseJSON.message)
                        window.location.reload();
                    }
                },
                beforeSend: function() {
                    // We can make status as processing for forms and all.
                },
                complete: function() {
                    // We can make status as processing done for forms and all.
                }
            })
        });
    });
}

function statusChangeCallback(response) {
    console.log(response);
    if (response.status === 'connected') {
        // userInformation(response.authResponse.accessToken);
    } else {
        console.log("please login")
    }
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId: '2407828289441487', // Live- bl.amdev.in
        // appId: '1030173360457523', //Live - brandlabel.net
        // appId: '1823203761325832', // Local- localhost:8080

        cookie: true,
        xfbml: true,
        version: 'v2.10'
    });


    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });

};

function gotoWriteExperience() {
    if (!data.userDetails || !data.userDetails._id) {
        // if (confirm('You first need to get login via facebook.')) {
        facebookLogin();
        // }
    } else if (window.location.href.indexOf('store') > -1 && window.location.href.indexOf('stores') < 1) {
        window.location.href = BASE_URL + 'create-experience/step2/' + data.store.storeId
    } else {
        window.location.href = BASE_URL + 'create-experience/step1';
    }
}
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

$('.sub-menu-top .log-out-btn').click(function() {
    $.ajax({
        url: BASE_URL + "logout",
        method: 'GET', // 'POST'
        cache: false,
        dataType: 'json',
        data: {},
        headers: {},
        success: function(response, status) { // Succesfull response status

            window.location = BASE_URL;

            // console.log("------ response: ", response);
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



})

$('#faq-search').keyup(function() {
    console.log("the search key", this.value)
    if (this.value && this.value != '') {
        console.log("here")
        $.ajax({
            url: BASE_URL + "getFAQs/?q=" + this.value,
            method: 'GET', // 'POST'
            cache: false,
            dataType: 'json',
            data: {},
            headers: {},
            success: function(response) {
                var html = "";
                if (response.status === 'success') {
                    if (response.docs.length > 0) {

                        response.docs.forEach(function(item) {
                            html += '<li><a href=' + BASE_URL + 'faq/' + item.section.masterId + '/' + item.category.masterId + '/' + item.faqId + '>' + item.title + '<span>' + item.section.masterValue + '</span></a></li>';
                        })

                        console.log("response got", response)

                        $('#search-result').html(html);
                        $('.faq-togle-cont').addClass('active');
                        $('.faq-togle-cont').css("visibility", "visible");
                    } else {
                        $('#search-result').html('');
                        $('.faq-togle-cont').removeClass('active');
                    }

                }
            },
            error: function(error) {},
            beforeSend: function() {

            },
            complete: function() {
                // We can make status as processing done for forms and all.
            }
        })
    } else {
        $('#search-result').html('');
        $('.faq-togle-cont').removeClass('active');
    }
});