//  ====================================================================

//	Theme Name: 
//	Theme URI: 
//	Description: This javascript file is using as a settings file. This file includes the sub scripts for the javascripts used in this template.
//	Version: 1.0
//	Author: 
//	Author 
//	Tags:

//  ====================================================================

//	TABLE OF CONTENTS
//	---------------------------

//   01. Preloader
//   02. Adding fixed position to header
//	 03. Toggles
//	 04. Rattings

//  ====================================================================

(function() {
    "use strict";


    // -------------------- 01. Preloader ---------------------
    // --------------------------------------------------------

    /*$(window).load(function() {
    	$("#loader").fadeOut();
    	$("#mask").delay(1000).fadeOut("slow");
    });*/

    // -------------- 02. Adding fixed position --------------- 
    // --------------------------------------------------------


    // For Header

    $(document).scroll(function() {
        if ($(document).scrollTop() >= 500) {
            $('.header-area-main').addClass('header-fixed-top');
        } else {
            $('.header-area-main').removeClass('header-fixed-top');
        }
    });



    // For Filter

    $(document).scroll(function() {
        if ($(document).scrollTop() >= 198) {
            $('.filter-header').addClass('filter-fixed-top');
        } else {
            $('.filter-header').removeClass('filter-fixed-top');
        }
    });



    // For Map sec

    $(document).scroll(function() {
        if ($(document).scrollTop() >= 178) {
            $('.map-floated-area').addClass('map-fixed-top');
        } else {
            $('.map-floated-area').removeClass('map-fixed-top');
        }
    });


    // For Experience Detail Sub Menu

    $(document).scroll(function() {
        if ($(document).scrollTop() >= 150) {
            $('.experience-store').addClass('floated-store-fixed');
        } else {
            $('.experience-store').removeClass('floated-store-fixed');

        }
    });


    // For Store Detail Sub Menu

    $(document).scroll(function() {
        if ($(document).scrollTop() >= 610) {
            $('.detailed-store').addClass('floated-store-fixed');
        } else {
            $('.detailed-store').removeClass('floated-store-fixed');

        }
    });

    // For Map Show Hide

    if ($(window).height() < 700) {
        $('.store-map').hide();
    } else {
        $('.store-map').show();
    }

    $(window).resize(function() {
        if ($(window).height() < 700) {
            $('.store-map').hide();
        } else {
            $('.store-map').show();
        }
    });


    // -------------------- 03. Toggles -------------------
    // --------------------------------------------------------

    $(".toggle-btn").click(function() {
        $(".main-menu").toggle();
    });





    // Top Bar Toggles

    $(document).on('click touchstart', function(e) {
        if ($(e.target).closest(".search-top-used").length > 0) {} else if ($(e.target).closest(".search-top-fb").length > 0) {

        } else {
            if ($(e.target).closest(".user-togle").length == 0&&$(".sub-menu-top").hasClass("active"))
                $(".sub-menu-top").removeClass('active');
            $(".search-top-used").removeClass('active');
            $(".search-top-fb").removeClass('active');
            $(".place-togle").removeClass('active');
            if ($(e.target).closest(".user-togle").length == 0&&$(".user-togle").hasClass("active"))
                $(".user-togle").removeClass('active');
            $(".serch-res-location").removeClass('active');
            $(".serch-res-dealer").removeClass('active');
            $(".faq-togle-cont").removeClass('active');
            $(".compare-items-cont").removeClass('active');
            $(".store-navigation").removeClass('active');
            $(".filter-settings-pop").removeClass('active');
            $(".offer-pop").removeClass('active');
        }

        if ($(e.target).closest(".user-togle").length > 0) {
            $(".sub-menu-top").toggleClass('active', !$(".sub-menu-top").hasClass("active"));
            e.preventDefault();
            $(".user-togle").toggleClass('active', !$(".user-togle").hasClass("active"));
        }

        if ($(e.target).closest(".place-togle").length > 0) {
            $(".search-top-used").toggleClass('active');
            e.preventDefault();
            $(".place-togle").toggleClass('active');
        }

        if ($(e.target).closest(".dealerships-togle").length > 0) {
            $(".serch-res-dealer").toggleClass('active');
            e.preventDefault();
            $(".dealerships-togle").toggleClass('active');
        }

        if ($(e.target).closest(".faq-togle").length > 0) {
            $(".faq-togle-cont").toggleClass('active');
            e.preventDefault();
            $(".faq-togle").toggleClass('active');
        }

        if ($(e.target).closest(".locations-togle").length > 0) {
            $(".serch-res-location").toggleClass('active');
            e.preventDefault();
            $(".locations-togle").toggleClass('active');
        }

        if ($(e.target).closest(".compare-btn").length > 0) {
            $(".compare-items-cont").toggleClass('active');
            e.preventDefault();
            $(".compare-btn").toggleClass('active');
        }

        if ($(e.target).closest(".compare-items-cont").length > 0) {
            $(".compare-items-cont").toggleClass('active');
            e.preventDefault();
            $(".compare-btn").toggleClass('active');
        }

        if ($(e.target).closest(".add-filter-btn").length > 0) {
            $(".filter-settings-pop").toggleClass('active');
            e.preventDefault();
            $(".add-filter-btn").toggleClass('active');
        }
        //remove bubble entry from search make
        if ($(e.target).closest(".remove").length > 0) {
            $(".filter-settings-pop").addClass('active');
            e.preventDefault();
        }

        if ($(e.target).closest(".more-links").length > 0) {
            $(".store-navigation").toggleClass('active');
            e.preventDefault();
            $(".more-links").toggleClass('active');
        }

        if ($(e.target).closest(".popup-cont").length > 0) {
            $(".filter-settings-pop").toggleClass('active');
            e.preventDefault();
            $(".add-filter-btn").toggleClass('active');
        }

        if ($(e.target).closest(".filter-settings-pop").length > 0) {
            $(".popup-cont").removeClass('active');
            e.preventDefault();
        }

        if ($(e.target).closest("#show-result").length > 0) {
            $(".filter-settings-pop").removeClass('active');
            e.preventDefault();
        }


    });


    // Graph Area Toggles

    $(".switcher").click(function() {
        $(".togg-input").toggleClass("on-stat");
        if ($(".togg-input").hasClass("on-stat")) {
            $(".custrating-single").hide(10);
            $(".advanced-filter").show(10);
        } else {
            $(".custrating-single").show(10);
            $(".advanced-filter").hide(10);
        }
    });


    // Popup Toggles

    $(".cus-popup").on('click touchstart', function(e) {
        $(".offer-pop").addClass('active');
        $("body").addClass('hide-scroll');
        e.preventDefault();
    });
    $(".close-popup").on('click touchstart', function(e) {
        $(".offer-pop").removeClass('active');
        $("body").removeClass('hide-scroll');
        e.preventDefault();
    });

    // Experience Popup 01

    $(".cus-popup-1").on('click touchstart', function(e) {
        $(".exp-detail-pop-01").addClass('active');
        $("body").addClass('hide-scroll');
        e.preventDefault();
    });
    $(".close-popup").on('click touchstart', function(e) {
        $(".exp-detail-pop-01").removeClass('active');
        $("body").removeClass('hide-scroll');
        e.preventDefault();
    });


    // Experience Popup 02

    $(".cus-popup-2").on('click touchstart', function(e) {
        $(".exp-detail-pop-02").addClass('active');
        $("body").addClass('hide-scroll');
        e.preventDefault();
    });
    $(".close-popup").on('click touchstart', function(e) {
        $(".exp-detail-pop-02").removeClass('active');
        $("body").removeClass('hide-scroll');
        e.preventDefault();
    });

    //Close post popup
    $(".close-popup").on('click touchstart', function(e) {
        $(".exp-post-pop-01").removeClass('active');
        $("body").removeClass('hide-scroll');
        e.preventDefault();
    });

    // Comment Section Toggle

    $("#comment-1").click(function() {
        $("#commentopt-1").toggle();
    });

    $("#comment-2").click(function() {
        $("#commentopt-2").toggle();
    });

    $("#comment-3").click(function() {
        $("#commentopt-3").toggle();
    });


    // Show All / Show Hide

    $(".show-less").click(function() {
        $(this).toggleClass('open');
        if ($(this).hasClass('open')) {
            $(this).find('span').html('SHOW LESS');
            loadAllMakes(false);
        } else {
            $(this).find('span').html('SHOW ALL')
            loadAllMakes(true)
            $(".cat-imgs").addClass('active');
        }
        setTimeout(function() {
            $(".cat-imgs").toggleClass('active');
        }, 10);
        // $( ".cat-imgs" ).toggleClass('active');
    });



    /*$('#rate-service-center li').on('click', function(e){
		e.preventDefault();
		$('#rate-service-center li').removeClass('active');
		$(this).addClass('active');
	});

	$('#rate-service-attittude li').on('click', function(e){
		e.preventDefault();
		$('#rate-service-attittude li').removeClass('active');
		$(this).addClass('active');
    });

	$('#rate-time-spent li').on('click', function(e){
		e.preventDefault();
		$('#rate-time-spent li').removeClass('active');
		$(this).addClass('active');
    });

	$('#rate-attittude-work li').on('click', function(e){
		e.preventDefault();
		$('#rate-attittude-work li').removeClass('active');
		$(this).addClass('active');
    });
	*/


    // -------------------- 02. Tooltip ---------------------
    // --------------------------------------------------------

    $("body").tooltip({ selector: '[data-toggle=tooltip]' });


    // ------------------- 02. Scroll To Top ------------------
    // --------------------------------------------------------

    $(function() {
        $('a[href*=#]:not([href=#])').click(function() {
            $('.store-navigation li a').parent().removeClass('active');
            $(this).parent().addClass('active');
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - 100
                    }, 1000);
                    return false;
                }
            }

        });
    });
    $(document).on("scroll", onScroll);

    function onScroll(event) {
        var scrollPos = $(document).scrollTop();
        $('.store-navigation>li>a[href*=#]:not([href=#])').each(function() {
            var currLink = $(this);
            var refElement = $(currLink.attr("href"));
            //alert(refElement);
            // console.log(currLink.attr("href"));
            if (refElement.position().top - 120 <= scrollPos && refElement.position().top + refElement.outerHeight(true) - 120 > scrollPos) {
                $('.store-navigation li').removeClass("active");
                currLink.parent().addClass("active");
            } else {
                currLink.parent().removeClass("active");
            }
        });
    }


})(jQuery);