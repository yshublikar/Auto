
//jQuery time

var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches



$(".next").click(function(){
	if(animating) return false;
	animating = false;
	current_fs = $(this).parent().parent().parent();
	next_fs = $(this).parent().parent().parent().next();
	//activate next step on progressbar using the index of next_fs
	$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
	//show the next fieldset
	next_fs.show(); 

	current_fs.hide();
	
	$('html,body').animate({
		scrollTop: $("#steps-top").offset().top}, 0
	);

});


$(".submit").click(function(){

	return false;

})

		

