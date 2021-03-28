$(document).ready(function() {
	// var body = document.body, html = document.documentElement;
	// var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
	var s = $("#portfolio");
	var c = $("#contact");
    var n = $("#nav");
	var pos = s.position();					   
	$(window).scroll(function() {
        var windowpos = $(window).scrollTop();
		if (windowpos >= pos.top & windowpos >= window.outerHeight) {
            n.removeClass("transparent");
		} else {
			n.addClass("transparent");	
		}

		if (windowpos >= c.position().top-10) {
            n.addClass("black-nav");
		} else {
			n.removeClass("black-nav");	
		}
	});
});