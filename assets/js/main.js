gsap.set(".cursorCustom", { xPercent: -50, yPercent: -50 });

let cursor = document.querySelector(".cursorCustom");
let cursorHoverArray = document.querySelectorAll(".hoverElement");
let hideCursorArray = document.querySelectorAll(".hideCursorElement");

let mouseX;
let mouseY;

window.addEventListener("mousemove", (e) => {
  gsap.to(cursor, 0, { x: e.clientX, y: e.clientY });
});

// Hover
cursorHoverArray.forEach((cursorHover) => {
  cursorHover.addEventListener("mouseenter", () => {
    gsap.to(cursor, 0, {
      scale: 1.8,
      rotate: 0,
      ease: Elastic.easeOut.config(1, 0.3),
    });
  });

  cursorHover.addEventListener("mousemove", () => {
    gsap.to(cursor, 0, {
      x: mouseX,
      y: mouseY,
    });
  });

  cursorHover.addEventListener("mouseleave", () => {
    gsap.to(cursor, 0, {
      scale: 1,
      ease: Elastic.easeIn.config(1, 0.3),
    });
  });
});

// Hide
hideCursorArray.forEach((hideCursor) => {
  hideCursor.addEventListener("mouseenter", () => {
    gsap.to(cursor, 0, {
      opacity: 0,
      ease: Elastic.easeOut.config(1, 0.3),
    });
  });

  hideCursor.addEventListener("mousemove", () => {
    gsap.to(cursor, 0, {
      x: mouseX,
      y: mouseY,
    });
  });

  hideCursor.addEventListener("mouseleave", () => {
    gsap.to(cursor, 0, {
      opacity: 1,
      ease: Elastic.easeIn.config(1, 0.3),
    });
  });
});

// // I would cache these vars outside the scroll for better performance
// var navWrap = $('#navWrap'),
// nav = $(nav),
// startPosition = navWrap.offset().top,
// stopPosition = $(' #stopHere').offset).top - nav.outerHeight);

// $(document).scroll(function () {
// //stick nav to top of page
// var y = $(this).scrollTop();
// if (y > startPosition) {
// nav.addClass('sticky');
// if (y > stopPosition) {
// nav.css('top', stopPosition - y);
// } else {
// nav.css('top', 0);
// ｝
// else {
// hav.removeClass ('sticky');
// }
