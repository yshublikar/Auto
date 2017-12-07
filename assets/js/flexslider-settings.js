//  ====================================================================
//	Theme Name: Safron Hotel
//	Theme URI: 
//	Description: This javascript file is using as a settings file of FLEX SLIDER.
//	Version: 1.0
//	Author: Responsive Experts
//	Author URI: 
//	Tags:
//  ====================================================================



(function() {
	"use strict";
	
	
	// ----------------------- Banner Slider JS ----------------------
	// ---------------------------------------------------------------
	
	$('.banner-main').flexslider({
		animation: "fade",
		start: function(slider){
		  $('body').removeClass('loading');
		}
	});
		
})(jQuery);


