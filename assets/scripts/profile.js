$(document).ready(function() {

    $('.setting-smt').click(function(event) {
        var isSub = $('input[name=isSubscribed]:checked').val();
        var notn = $('#notification').val();
        var emailMeMyMessages = $('input[name=emailMeMyMessages]:checked').val() === "true"? true: false;
        var anonymous = $('input[name=anonymous]:checked').val();
        updateSetting(emailMeMyMessages, notn, isSub, anonymous);

    })
    $("#notification").on("selectmenuselect", function(event, ui) {
      updateSetting($('#emailMeMyMessages').val(), $('#notification').val(), $('input[name=isSubscribed]:checked').val(), $('input[name=anonymous]:checked').val());
    })



    if (data.docs && data.docs.userId) {

        var visits = null;
        if (readCookie('brandLabelProfileVisits') != null) {
            visits = JSON.parse(readCookie('brandLabelProfileVisits'));
        }

        if (visits == null) {
            var visits = [data.docs.userId];
            createCookie('brandLabelProfileVisits', JSON.stringify(visits), 730);
            addIdToVisits();
            console.log("---- First visit.")
        } else if (visits.indexOf(data.docs.userId) == -1) {
            if (data.userDetails) {
                if (data.userDetails.userId && data.userDetails.userId != data.docs.userId) {
                    visits.push(data.docs.userId);
                    createCookie('brandLabelProfileVisits', JSON.stringify(visits), 730);
                    addIdToVisits();
                    console.log("---- Another profile visit.")
                }
            } else {
                visits.push(data.docs.userId);
                createCookie('brandLabelProfileVisits', JSON.stringify(visits), 730);
                addIdToVisits();
                console.log("---- Another profile visit.")
            }
        } else {
            console.log("---- Already visited.")
        }
    }

});

function addIdToVisits() {
    $.ajax({
        url: BASE_URL + "trackProfileVisitCount/" + data.docs._id,
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

}

function updateSetting(emailMeMyMessages, notification, isSubscribed, anonymous) {
    console.log("notification**", notification);
    console.log("isSubscribed**", isSubscribed);

    if (isSubscribed == undefined || isSubscribed == '') { isSubscribed = false }

    if (anonymous == undefined || anonymous == '') { anonymous = false }

    console.log("is subscribed: ", isSubscribed);
    console.log("notification: ", notification);
    console.log("emailMeMyMessages: ", emailMeMyMessages);

    $.ajax({
        url: BASE_URL + 'update/settings',
        method: 'POST', // 'POST'
        cache: false,
        dataType: 'json',
        data: { emailMeMyMessages: emailMeMyMessages, notification: notification, isSubscribed: isSubscribed, anonymous: anonymous },
        headers: {},
        success: function(response) {
            console.log("response here:", response);
            if (response.status === 'success')
                window.location.reload();
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

function getUserActivity(skip, limit, liId, startFrom) {

    $.ajax({
        url: BASE_URL + "getUserActivity/" + data.docs._id + "?skip=" + skip + " &limit=" + limit + "&startFrom=" + startFrom + "&filterBy=" + filter.filterBy,
        method: 'GET', // 'POST'
        cache: false,
        dataType: 'json',
        data: {},
        headers: {},
        success: function(response) {
            if (response.status === 'success') {
                $('#all-activity .activity-result-list').html(response.html);
                $('.pagination-01 .pagination').html(response.pagination);
                $('.pagination-01 .pagination .active').removeClass('active');
                $('#' + liId + '').addClass('active');

            }

        },
        error: function(error) {
            console.log("error", error)

        },
        beforeSend: function() {

        },
        complete: function() {
            // We can make status as processing done for forms and all.
        }
    })


}