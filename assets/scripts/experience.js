 
//step1

$(document).ready(function() {


      $('#city-search').keyup(function() {
            if (this.value && this.value != '') {
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
                                $.each(response.docs, function(item) {
                                    var data = "'" + response.docs[item].name + "','" + response.docs[item]._id + "'";
                                    html += '<li onclick="selectCity(' + data + ')"><a ><i class="pin-ico"></i>' + response.docs[item].name + '<span>' + response.docs[item].state + '</span></a></li>';
                                })
                            } else {
                                html += '<li onclick="selectCity(' + ' ' + ')"><a><i class="pin-ico"></i>result not found <span></span></a></li>';
                            }

                        } else {
                            html += '<li onclick="selectCity(' + ' ' + ')"><a ><i class="pin-ico"></i>result not found <span></span></a></li>';
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
            if (this.value && this.value != '') {
                $('.first-step .error-main-mess').css('display', 'none');
                if (!cityModel._id) {
                    $('.first-step .error-main-mess').css('display', 'block');
                    $('.first-step .error-main-mess').text("Please select city");
                    return;
                }
                $.ajax({
                    url: BASE_URL + "getStores/" + cityModel._id + "?q=" + this.value,
                    method: 'GET', // 'POST'
                    cache: false,
                    dataType: 'json',
                    data: {},
                    headers: {},
                    success: function(response) {
                        var html = "";
                        if (response.status === 'success') {
                            $('#store-result').html('');
                            if (response.docs.length > 0) {
                                stores = response.docs;

                                $.each(response.docs, function(item) {
                                    //onclick="selectStore(' + item + ')"
                                    //href="<%= BASE_URL+'create-experience-step2' %>"
                                    //onclick="searchStore(' + item + ')"
                                    //console.log("response id of store: ",response.docs[item]._id);
                                  

                                    html += '<li onclick="searchStore(' + response.docs[item].storeId + ')"><a ><i class="' + (response.docs[item].type === "Workshop" ? "users-ico" : "car-ico") + '"></i>' + response.docs[item].name + '<span>' + response.docs[item].address + '</span></a></li>';
                                })
                            } else {
                                html += '<li><a href="#"><i class="add-ico"></i> <span>Can`t find what you`re looking for?</span> Add a listing </a></li>';
                            }

                        } else {
                            html += '<li><a href="#"><i class="add-ico"></i> <span>Can`t find what you`re looking for?</span> Add a listing </a></li>';
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
   
})

      



        function selectStore(index) {
            storeModel = stores[index];
            // console.log("storeModel: ",storeModel);
            $('#store-search').val(storeModel.name);
            $('.first-step').css('display', 'none');
            $('.second-step').css('display', 'block');
            $($('#progressbar').find('li')[1]).addClass('active');

            $($('.dealer-bx').find('img')[0]).attr("src", BASE_URL + storeModel.logo);;
            $('.dealer-bx .categor').text(storeModel.type);
            $($('.dealer-bx').find('h4')[0]).text(storeModel.name);
            $('.dealer-bx .phone').text(storeModel.phone);
            exp_types();
            car_model();

        }

        function searchStore(id) {
           
           $('#searchFrm').attr('action', BASE_URL+'create-experience/step2/'+ id);
            $('#searchFrm').submit();
            
                        

        }

        function selectCity(city, id) {
            if (city != '' && id && id != '') {
                cityModel.city = city;
                cityModel._id = id;
                $('#city-search').val(city);
            } else {
                cityModel.city = undefined;
                cityModel._id = undefined;
            }
        }

        $('.right-box .submit-btn').click(function(event) {
            $('.first-step .error-main-mess').css('display', 'none');
            event.preventDefault();
            if (!cityModel.city && !cityModel._id) {
                $('.first-step .error-main-mess').css('display', 'block');
                $('.first-step .error-main-mess').text("Please select city");

            }
            if (!storeModel.name && !storeModel._id) {
                $('.first-step .error-main-mess').css('display', 'block');
                $('.first-step .error-main-mess').text("Please select store");
            }

        })

