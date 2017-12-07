  $(document).ready(function() {
      if (readCookie('browsingUniqueUserId') == null) {
          createCookie('browsingUniqueUserId', (new Date().valueOf()) + '', 365);
      }
      addIdToVisits(readCookie('browsingUniqueUserId'));
  })

  function addIdToVisits(browsingUniqueUserId) {
      if (data.experience.visitedCount.indexOf(browsingUniqueUserId) == -1) {
          if (!(data.userDetails && data.experience.userId._id == data.userDetails._id)) {
              $.ajax({
                  url: BASE_URL + "trackExperienceVisitCount/" + data.experience._id + "/" + browsingUniqueUserId,
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
              console.log("----------- Own user.")
          }
      } else {
          console.log("----------- Already visited.")
      }
  }

  function changeClass(el) {
      $(el).parent().find('li').removeClass('active');
      $(el).addClass('active');

  }

  function LikeOrFlag(type, expId, postId, userId, commentId, action) {
      console.log("Type", type)
      console.log("expId", expId)
      console.log("Post id", postId)
      console.log("User id", userId)
      console.log("commentId id", commentId)
      if (userId == undefined || userId == "") {
          facebookLogin(function(result) {
              console.log("got the facebook result", result.docs._id)
          });
      } else {
          $.ajax({
              url: BASE_URL + "LikeOrFlag/" + expId,
              method: 'PUT', // 'POST'
              cache: false,
              dataType: 'json',
              data: { "type": type, "postId": postId, "userId": userId, "commentId": commentId, "action": action },
              headers: {},
              success: function(response, status) { // Succesfull response status
                  var id = '';
                  var Setclass = '';
                  var html = '';
                  if (type == "Post") {
                      console.log("inside Post")
                      id = postId + action;
                  } else if (type == "Comment") {
                      console.log("inside Comment")
                      id = commentId + action;
                  }
                  Setclass = response.action == "active" ? 'active' : '';
                  if (action == "likes") {
                      html = '<a href="javascript:;" class="fb-btn ' + Setclass + '" data-toggle="tooltip"\
             data-placement="bottom" title="" data-original-title="Tooltip contents goes1 here"\
              onclick="LikeOrFlag(\'' + type + '\',\'' + expId + '\',\'' + postId + '\',\'' + userId + '\',\'' + commentId + '\',\'' + action + '\')"><i class="fa fa-thumbs-up"\
               aria-hidden="true"></i>Like <span>(' + response.likes.length + ')</span></a>'

                  } else if (action == "flagged") {
                      html = '<a href="javascript:;" class="fb-btn ' + Setclass + '" data-toggle="tooltip"\
             data-placement="bottom" title="" data-original-title="Tooltip contents goes1 here"\
              onclick="LikeOrFlag(\'' + type + '\',\'' + expId + '\',\'' + postId + '\',\'' + userId + '\',\'' + commentId + '\',\'' + action + '\')"><i class="fa fa-flag" aria-hidden="true"></i> Flag </span></a>'
                  }
                  console.log("id", id)
                  $('#' + id).html(html);
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

  function saveComment(expId, postId, userId, postIndex) {
      var comment = $('#' + postId + 'userCommentText').val();
      console.log("expId", expId)
      console.log("Post id", postId)
      console.log("User id", userId)
      if (userId == undefined || userId == "") {
          facebookLogin();
      } else {
          $.ajax({
              url: BASE_URL + "saveComment/" + expId,
              method: 'PUT', // 'POST'
              cache: false,
              dataType: 'json',
              data: { "postId": postId, "userId": userId, "comment": comment },
              headers: {},
              success: function(response, status) { // Succesfull response status
                  console.log("response", response);
                  if (response.status === "success") {
                      // window.location.reload();
                      // var user=
                      var post = response.docs.posts.find(function(p) { return p._id + "" === postId + "" });
                      if (post) {
                          var comment = post.comments[post.comments.length - 1];

                          var newLi = "<li><span class='"+ comment._id +"comment-desc linkify'>" + comment.comment;
                          newLi += "</span><div class='post-details-all clearfix'>";
                          newLi += "<ul class='post-details'>";

                          newLi += "<li id='" + comment._id + "likes'>";
                          newLi += "<a href='javascript:;' class='fb-btn <%=(data.userDetails&&subItem.likes.length>0&&subItem.likes.findIndex(x=> x.like==data.userDetails._id)!=-1? " +
                              'active' + ":" + '' + ")%>' data-toggle='tooltip' data-placement='bottom' title='' data-original-title='Tooltip contents goes here'\
                          onclick=\"LikeOrFlag('Comment','" + expId + "','" + postId + "','" + userDetails._id + "','" + comment._id + "','likes')\"><i class='fa fa-thumbs-up' aria-hidden='true'>";
                          newLi += "</i>Like <span>(" + comment.likes.length + ")</span></a></li>";

                          newLi += "<li id='" + comment._id + "flagged'>";
                          var flagging = "Comment,'" + expId + ",'" + postId + ",'" + userDetails._id + ",'" + comment._id + "',flagged";
                          newLi += "<a href='javascript:;' class='fb-btn <%=(data.userDetails&&subItem.flagged.length>0&&subItem.flagged.indexOf(data.userDetails._id)!=-1? " + 'active' + ":" + '' + ")%>' data-toggle='tooltip' data-placement='bottom' title='' data-original-title='Tooltip contents goes here' onclick=\"LikeOrFlag('Comment','" + expId + "','" + postId + "','" + userDetails._id + "','" + comment._id + "','flagged')\"><i class='fa fa-flag' aria-hidden='true'>";
                          newLi += "</i> Flag <span></span></a></li>";

                          newLi += "<li >";
                          newLi += "<a href='javascript:;' data-toggle='modal' data-target='abc' title='' data-original-title='Tooltip contents goes here' onclick=\"editComment('" + expId + "','" + postId + "','" + comment._id + "','" + userDetails._id + "','" + comment.comment + "')\"><i class='fa fa-pencil' aria-hidden='true'>";
                          newLi += "</i> Edit </a></li>";
                          newLi += "</ul>";
                          newLi += "<div id='" + comment._id + "Modal'></div>";
                          newLi += "<div class='exp-user'>";
                          newLi += "<div class='user-details clearfix'>";
                          newLi += "<span class='profile-img'>";
                          newLi += '<img src="' + BASE_URL + (userDetails && userDetails.anonymous ? userDetails.avatarImage : (userDetails ? userDetails.profileImage : '')) + '" alt="" onerror="this.src=\'' + BASE_URL + 'img/user-demo.png\'"> <a class="text-hover-green" href="' + (BASE_URL + 'profile/' + (userDetails && userDetails.userId)) + '">' +  ((userDetails && userDetails.anonymous) ? userDetails.displayName: (userDetails ? userDetails.name : 'Unknown user') )//((userDetails && userDetails.name) ? userDetails.name : 'Unknown') || 'N/A'


                          //newLi += '<img src="' + BASE_URL + (userDetails && userDetails.anonymous ? userDetails.avatarImage : (userDetails ? userDetails.profileImage : '')) + '" alt="" onerror="this.src=\'' + BASE_URL + 'img/user-demo.png\'"> From ' + (userDetails && userDetails.name) || 'N/A'
                          //newLi += "<img onerror='this.src='" + BASE_URL + "img/user-demo.png' src='" + (BASE_URL+userDetails.profileImage)+ "' alt=''> "+userDetails.name;
                          newLi += "</a></span>";
                          newLi += "</div>";
                          newLi += "<span class='posted'>Posted " + moment(comment.postedOn).tz('Asia/Kolkata').format('llll') + "</span>";
                          newLi += "</div>"
                          newLi += "</div>"
                          newLi += "</li>"
                          $('#' + postIndex).append(newLi);
                          $('#' + postId + 'userCommentText').val('')
                          toggleComment(postId + 'commentopt-1');
                      }
                      $('.linkify').linkify();
                  }
              },
              error: function(error) {
                  // Error state of response
                  $('#' + postId + 'addComment').prop('disabled', false);
                  var html = '<i class="fa fa-check" aria-hidden="true"></i> Add Comment';
                  $('#' + postId + 'addComment').html(html);
              },
              beforeSend: function() {
                  $('#' + postId + 'addComment').prop('disabled', true);
                  var html = '<i class="fa fa-check" aria-hidden="true"></i> Saving......';
                  $('#' + postId + 'addComment').html(html);

              },
              complete: function() {
                  $('#' + postId + 'addComment').prop('disabled', false);
                  var html = '<i class="fa fa-check" aria-hidden="true"></i> Add Comment';
                  $('#' + postId + 'addComment').html(html);
                  // We can make status as processing done for forms and all.
              }
          })
      }
  }

  function updateCommentAndPost(type, expId, postId, commentId, userId) {
      var comment = {};
      console.log("inside updateCommentAndPost", $('#' + postId + 'editPostdatepicker').val());
      var flag = false;
      if (type == "Post") {
          var rating = $('#' + postId + 'editPostRating').val();
          var title = $('#' + postId + 'editPostTitle').val();
          var desc = $('#' + postId + 'editPostDesc').val();
          var incidentDate = $('#' + postId + 'editPostdatepicker').val();
          console.log("~~~~~~~ incidentDate", incidentDate);
          if (rating == "" || rating == null || rating < 1) {
              flag = true;
          }
          comment = { "rating": rating, "title": title, "description": desc, "incidentDate": incidentDate };

      } else if (type == "Comment") {
          comment = { "comment": $('#' + commentId + 'Text').val() };
      }
      if (userId == undefined || userId == "") {
          facebookLogin();
      } else {
          if (flag == false) {
              $.ajax({
                  url: BASE_URL + "updateCommentAndPost/" + expId,
                  method: 'PUT', // 'POST'
                  cache: false,
                  dataType: 'json',
                  data: { "type": type, "postId": postId, "userId": userId, "commentId": commentId, "comment": comment, "storeId": data.experience.storeId._id },
                  headers: {},
                  success: function(response, status) { // Succesfull response status
                      if (response.docs != null && response.docs != undefined) {
                          console.log("response", response)
                          if (type == "Post") {
                              $('.' + postId + 'container >h3').text(comment.title);
                              html = '';
                              for (var i = 1; i <= 5; i++) {
                                  html += '<li'
                                  if (i <= comment.rating) {
                                      html += ' class="active"'
                                  }
                                  html += '><a href="javascript:;"><i class="fa fa-star" aria-hidden="true"></i></a></li>';
                              }

                              $('.' + postId + 'rating-cont >ul').html(html);
                             // $('.' + postId + 'cont-area >p').text(comment.description);
                             $('.' + postId + 'cont-area').html('<p class="linkify">'+ comment.description+ '</p>');
                             
                              $('#' + postId + 'incidentDateHidden').val(moment($('#' + postId + 'editPostdatepicker').val()).format('MM/DD/YYYY h:mm a'));
                              $('#' + postId + 'editPost').removeClass('active');
                              $("body").removeClass('hide-scroll');

                          } else if (type == "Comment") {
                              $('.' + commentId + 'comment-desc').text(comment.comment);
                              $('#' + commentId).modal('toggle');
                          }
                      }
                  },
                  error: function(error) {
                      // Error state of response
                      console.log("------ Error: ", error);
                  },
                  beforeSend: function() {
                      $('.editModel').prop('disabled', true);
                      var html = '<i class="fa fa-check" aria-hidden="true"></i> Updating......';
                      $('.editModel').html(html);
                  },
                  complete: function() {
                      $('.editModel').prop('disabled', false);
                      if (type == "Post") {
                          var html = '<i class="fa fa-check" aria-hidden="true"></i> Update Post';
                      } else {
                          var html = '<i class="fa fa-check" aria-hidden="true"></i> Update Comment';
                      }
                      $('.editModel').html(html);
                      $('.linkify').linkify();
                  }
              })
          } else {
              $('.exp-post-pop-01 .error-main-mess').css('display', 'block');
              $('.exp-post-pop-01 .error-main-mess').text("Please select rating");
          }
      }
  }

  function editPost(postId, title, desc, incidentDate) {
      $('#' + postId + 'editPostTitle').value = $('.' + postId + 'container >h3').val();
      $('#' + postId + 'editPostDesc').value = $('.' + postId + 'cont-area >p').val();
      console.log("incidentDate", incidentDate + "jjjj")
      $('#' + postId + '_datetimepicker').datetimepicker();
      $('#' + postId + 'editPostdatepicker').val(moment($('#' + postId + 'incidentDateHidden').val()).format('MM/DD/YYYY h:mm a'));

      $('#' + postId + 'editPost').addClass('active');
      $("body").addClass('hide-scroll');
  }

  function editComment(expId, postId, commentId, userId, data) {
      var html = "";
      var textareaId = commentId + "Text";
      var modalId = commentId;
      data = $('.' + commentId + 'comment-desc').text();
      console.log("dataaa", data)
      var modalContainerId = commentId + "Modal";
      html = '<div class="modal fade" id="' + modalId + '" role="dialog">\
                <div class="modal-dialog modal-sm">\
                    <div class="modal-content">\
                        <div class="modal-header" style="text-align:center;">\
                        <a class="edit-comment-close" data-dismiss="modal"><img src="/img/close-large-ico.png" alt=""></a>\
                            <h4 class="modal-title">Edit Comment</h4>\
                            <p>Changed your mind or forgot to write something?</p>\
                        </div>\
                        <form action="javascript:updateCommentAndPost(\'' + "Comment" + '\',\'' + expId + '\',\'' + postId + '\',\'' + commentId + '\',\'' + userId + '\')">\
                            <div class="modal-body">\
                                <textarea class="frm-txtarea-gray" placeholder="Describe about yourself" id="' + textareaId + '" required>' + data + '</textarea>\
                             </div>\
                             <div class="modal-footer">\
                                <button class="green-btn-01 editModel" type="submit"><i class="fa fa-check" aria-hidden="true"></i> Update Comment</button>\
                            </div>\
                        </form>\
                    </div>\
                </div>\
            </div>';
      $('#' + modalContainerId).html(html);
      $('#' + modalId).modal();
  }

  function addPost(expId, userId, storeId) {

      var title = $('#userPostTitle').val();
      var description = $('#userPostDesc').val();
      var rating = $('#postRating').val();
      var incidentDate = $('#incidentDate').val();
      console.log("incidentDate", incidentDate);
      var data = { "postData": { "rating": rating, "title": title, "description": description, "incidentDate": incidentDate }, "storeId": storeId }
      console.log("expId", expId)
       var content = $("input#userPostTitle").val() //content is now the value of the text box
            var words = content.trim().split(/\s+/); //words is an array of words, split by space
            var num_words = words.length; //num_words is the number of words in the array

            if (num_words > 10) {
               alert("You have entered more than 10 word in title field.")
                return;
            }
      if (userId == undefined || userId == "") {
          facebookLogin();
      } else {
          if (rating != null && rating != "") {
              $.ajax({
                  url: BASE_URL + "addPost/" + expId,
                  method: 'PUT', // 'POST'
                  cache: false,
                  dataType: 'json',
                  data: data,
                  headers: {},
                  success: function(response, status) { // Succesfull response status
                      console.log("response", response);
                      if (response.docs != null && response.docs != undefined) {
                          window.location.reload() // = BASE_URL + 'experience-details/' + response.docs.experienceId
                      }
                  },
                  error: function(error) {
                      // Error state of response
                      console.log("------ Error: ", error);
                  },
                  beforeSend: function() {
                      $('#add-post-btn').prop('disabled', true);
                      var html = '<i class="fa fa-check" aria-hidden="true"></i> Saving......';
                      $('#add-post-btn').html(html);

                  },
                  complete: function() {
                      // We can make status as processing done for forms and all.
                      $('#add-post-btn').prop('disabled', false);
                      var html = '<i class="fa fa-check" aria-hidden="true"></i> Add your update';
                      $('#add-post-btn').html(html);
                  }
              })
          } else {
              $('.exp-detail-pop-01 .error-main-mess').css('display', 'block');
              $('.exp-detail-pop-01 .error-main-mess').text("Please select rating");
          }
      }
  }

  function closeStory(data, expId, formId, storeId) {
      data = JSON.parse(data);
      var flag = false;
      for (var i = 0; i < data.length; i++) {
          if (data[i].type == "Rating") {
              var value = $('#' + data[i].groupId + data[i].questionId + 'rating').val();
              if (value == null || value == "") {
                  flag = true;
              }
          }
      }
      if (flag == true) {
          $('.exp-detail-pop-02 .error-main-mess').css('display', 'block');
          $('.err-pop-sections').css('display', 'block');
          $('.exp-detail-pop-02 .error-main-mess').text("Please select rating");
      } else {

          for (var i = 0; i < data.length; i++) {
              var value;
              if (data[i].type == "Rating") {
                  value = $('#' + data[i].groupId + data[i].questionId + 'rating').val();
              } else if (data[i].type == "Opinion") {
                  value = $('.' + data[i].groupId + data[i].questionId + 'opinion').find('li.active a').data('value');
              } else if (data[i].type == "Boolean") {
                  if (data[i].groupId == "0") {
                      value = $('.0' + data[i].questionId + 'indQue').find('label.ui-checkboxradio-checked').data('value');
                  } else {
                      value = $('.' + data[i].groupId + data[i].questionId + 'boolean').find('label.ui-checkboxradio-checked').data('value');
                  }
              }

              data[i].value = parseInt(value);
          }

          var isRecommended = parseInt($('.isRecommended').find('label.ui-checkboxradio-checked').data('value'));
          var closingNotes = $("#closingNotes").val();
          $.ajax({
              url: BASE_URL + "closeSotry/" + expId,
              method: 'PUT', // 'POST'
              cache: false,
              dataType: 'json',
              data: { "questions": data, "formId": formId, "storeId": storeId, "isRecommended": isRecommended, "closingNotes": closingNotes },
              headers: {},
              success: function(response, status) { // Succesfull response status
                  if (response.docs != null && response.docs != undefined) {
                      window.location.reload();
                  }
              },
              error: function(error) {
                  // Error state of response
                  console.log("------ Error: ", error);
              },
              beforeSend: function() {
                  $('#close-story-btn').prop('disabled', true);
                  var html = '<i class="fa fa-times" aria-hidden="true"></i> Closing Story......';
                  $('#close-story-btn').html(html);

              },
              complete: function() {
                  // We can make status as processing done for forms and all.
              }
          })
      }
  }

  function toggleComment(id) {
      $('#' + id).toggle();
  }

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
      if (data.experience && data.experience.storeId) {
          stores.push(data.experience.storeId);
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
          this.setZoom(11);
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