// $(window).on('load',function () {
// 	$(".counter-value").text = 0
// })
var a = 0;
$(window).scroll(function () {
	if ($("#counter").offset()) {
		var oTop = $("#counter").offset().top - window.innerHeight;
		if (a == 0 && $(window).scrollTop() > oTop) {
			$(".counter-value").each(function () {
				var $this = $(this),
					countTo = $this.attr("data-count");
				$({
					countNum: $this.text(),
				}).animate(
					{
						countNum: countTo,
					},

					{
						duration: 3000,
						easing: "swing",
						step: function () {
							$this.text(Math.floor(this.countNum));
						},
						complete: function () {
							$this.text(this.countNum);
						},
					}
				);
			});
			a = 1;
		}
	}
	else {
		console.log('no counter')
	}
});
