$(function() {

    function ratingEnable() {



        $('.example-square').barrating('show', {

            theme: 'bars-square',

            showValues: true,

            showSelectedRating: true,
			hoverState: true

        });







        $('#example-fontawesome-o').barrating({

            theme: 'fontawesome-stars-o',

            showSelectedRating: false,

            initialRating: currentRating,

            onSelect: function(value, text) {

                if (!value) {

                    $('#example-fontawesome-o')

                        .barrating('clear');

                } else {

                    $('.stars-example-fontawesome-o .current-rating')

                        .addClass('hidden');



                    $('.stars-example-fontawesome-o .your-rating')

                        .removeClass('hidden')

                        .find('span')

                        .html(value);

                }

            },

            onClear: function(value, text) {

                $('.stars-example-fontawesome-o')

                    .find('.current-rating')

                    .removeClass('hidden')

                    .end()

                    .find('.your-rating')

                    .addClass('hidden');

            }

        });

    }



    function ratingDisable() {

        $('select').barrating('destroy');

    }



    $('.rating-enable').click(function(event) {

        event.preventDefault();



        ratingEnable();



        $(this).addClass('deactivated');

        $('.rating-disable').removeClass('deactivated');

    });



    $('.rating-disable').click(function(event) {

        event.preventDefault();



        ratingDisable();



        $(this).addClass('deactivated');

        $('.rating-enable').removeClass('deactivated');

    });



    ratingEnable();

});

