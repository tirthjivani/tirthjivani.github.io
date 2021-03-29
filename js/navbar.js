$(document).ready(function() {
	$("#iirs").removeClass("animate__animated animate__fadeIn");
    $("#truein").removeClass("animate__animated animate__fadeIn");
    $("#meris").removeClass("animate__animated animate__fadeIn");
	$(window).scrollTop(0);
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