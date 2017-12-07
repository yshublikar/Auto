// Jquery UI Settings

$(function() {
    $("#profile-tabs").tabs();
    $("#activity-tabs").tabs();
    $(".ui-checkboxs").checkboxradio();
    $(".select-ui").selectmenu();
    $("#datepicker").datepicker({
        dateFormat: "dd MM yy"
    });
    $.widget.bridge('uitooltip', $.ui.tooltip);
    $("#faq-accordion").accordion({ heightStyle: 'content', collapsible: true });

    $('#faq-accordion .title-accordion').bind('click', function() {

        var self = this;

        setTimeout(function() {

            theOffset = $(self).offset();

            $('body,html').animate({ scrollTop: theOffset.top - 200 });

        }, 310); // ensure the collapse animation is done

    });
});