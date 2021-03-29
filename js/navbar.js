$(document).ready(function() {
	// var body = document.body, html = document.documentElement;
	// var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
			   
	$(window).scroll(function() {
        var windowpos = $(window).scrollTop();
		if (windowpos >= $("#portfolio").position().top & windowpos >= window.outerHeight) {
            $("#nav").removeClass("transparent");
		} else {
			$("#nav").addClass("transparent");	
		}

		if (windowpos >= $("#contact").position().top-10) {
            $("#nav").addClass("black-nav");
		} else {
			$("#nav").removeClass("black-nav");	
		}
	});
});