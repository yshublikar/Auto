// Owl Carousel Settings


$(document).ready(function() {
	
  // Home Carousel
  $('#home-carousel').owlCarousel({
	loop:true,
	margin: 10,
	autoplay:true,
	autoplayTimeout:10000,
	autoplayHoverPause:true,
	responsiveClass: true,
	responsive: {
	  0: {
		items: 1,
		nav: true
	  },
	  600: {
		items: 2,
		nav: true
	  },
	  1000: {
		items: 3,
		nav: true,
		margin: 30
	  }
	}
  })
  
  
  // Team Carousel
  $('#team-slider').owlCarousel({
	loop:true,
	margin: 10,
	autoplay:true,
	autoplayTimeout:3000,
	autoplayHoverPause:true,
	responsiveClass: true,
	responsive: {
	  0: {
		items: 1,
		nav: true
	  },
	  470: {
		items: 2,
		nav: true
	  },
	  600: {
		items: 3,
		nav: true
	  },
	  1000: {
		items: 4,
		nav: true,
		margin: 30
	  }
	}
  })
  
  
  // Brand Carousel
  $('#brand-slider').owlCarousel({
	loop:true,
	margin: 10,
	autoplay:true,
	autoplayTimeout:3000,
	autoplayHoverPause:true,
	responsiveClass: true,
	responsive: {
	  0: {
		items: 1,
		nav: true
	  },
	  470: {
		items: 2,
		nav: true
	  },
	  600: {
		items: 3,
		nav: true
	  },
	  1000: {
		items: 5,
		nav: true,
		margin: 30
	  }
	}
  })
  
  
  // Offer Carousel
  $('#offer-slider').owlCarousel({
	loop:true,
	margin: 10,
	autoplay:true,
	autoplayTimeout:5000,
	autoplayHoverPause:true,
	responsiveClass: true,
	responsive: {
	  0: {
		items: 1,
		nav: true
	  },
	  470: {
		items: 1,
		nav: true
	  },
	  600: {
		items: 2,
		nav: true
	  },
	  1000: {
		items: 3,
		nav: true,
		margin: 30
	  }
	}
  })

  
})




