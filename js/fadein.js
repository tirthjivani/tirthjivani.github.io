$(window).scroll(function () {
    if ($(window).scrollTop() > ($("#iirs").offset().top - window.innerHeight + 400)) {
        $("#iirs").css.opacity = 1;
        $("#iirs").addClass("animate__animated animate__fadeIn");
    }
    
    if ($(window).scrollTop() > ($("#truein").offset().top - window.innerHeight + 400)) {
        $("#truein").css.opacity = 1;
        $("#truein").addClass("animate__animated animate__fadeIn");
    }
    
    if ($(window).scrollTop() > ($("#meris").offset().top - window.innerHeight + 400)) {
        $("#meris").css.opacity = 1;
        $("#meris").addClass("animate__animated animate__fadeIn");
    }
    

});