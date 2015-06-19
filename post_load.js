(function ($) {
    //$('#bl_area .bl_item').click(function (e) {
    //    var bid = $(this).attr('data-bid');
    //    var isSmartphone = (navigator.userAgent.match(/(iPad|iPhone|iPod|Android)/gi) ? true : false);
    //    var urlprefix = isSmartphone ? "untappd:///?beer=" : "https://untappd.com/beer/";
    //    if (isSmartphone) {
    //        var now = new Date().valueOf();
    //        setTimeout(function () {
    //            if (new Date().valueOf() - now > 100) return;
    //            window.location = "https://untappd.com/beer/" + bid;
    //        }, 25);
    //        window.location = "untappd:///?beer=" + bid;
    //    } else {

    //        window.location = "https://untappd.com/beer/" + bid;

    //    };

    //    window.location.href = "https://untappd.com/beer/" + bid;
    //});
    $('<div>').load('dialog.html').appendTo('html');
    $('#bl_area .bl_item').click(click_Item);
	function click_Item(event) {
	    var dialog = $('#bl_dialog').dialog({
	        autoOpen: true,
	        height: 300,
	        width: 350,
	        modal: true,
	        dialogClass: 'wp-dialog',
	        buttons: {
	            "Close": function () {
	                dialog.dialog("close");
	            }
	        }
	    });
	};
}(jQuery));