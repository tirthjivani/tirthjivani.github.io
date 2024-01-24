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
    gsap.to(cursor, 0.3, {
      scale: 1.6,
      rotate: 0,
      ease: "circ.out",
    });
  });

  cursorHover.addEventListener("mousemove", () => {
    gsap.to(cursor, 0, {
      x: mouseX,
      y: mouseY,
    });
  });

  cursorHover.addEventListener("mouseleave", () => {
    gsap.to(cursor, 0.3, {
      scale: 1,
      ease: "circ.out",
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

var bgImage = document.querySelector(".transform-this-image");
var bgText = document.querySelector(".transform-this-text");

var throttle = function (type, name, obj) {
  var obj = obj || window;
  var running = false;
  var func = function () {
    if (running) {
      return;
    }
    running = true;
    requestAnimationFrame(function () {
      obj.dispatchEvent(new CustomEvent(name));
      running = false;
    });
  };
  obj.addEventListener(type, func);
};

throttle("scroll", "optimizedScroll");

window.addEventListener("optimizedScroll", function () {
  bgImage.style.transform = "translateY(-" + window.scrollY * 0.1 + "px)";
});

window.addEventListener("optimizedScroll", function () {
  bgText.style.transform = "translateY(" + window.scrollY * 2 + "px)";
});
