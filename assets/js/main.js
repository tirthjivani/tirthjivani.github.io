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
      scale: 2,
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

document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.querySelector(".carousel");
  let isTabActive = true;
  let animation;
  let animationStartTime;
  let animationPausedTime = 0;

  // Set the width of the carousel container to fit all the images
  const originalImages = document.querySelectorAll(".carousel img");
  const carouselWidth = Array.from(originalImages).reduce((sum, img) => sum + img.clientWidth, 0);
  carousel.style.width = `${carouselWidth}px`;

  // Intersection Observer to start animation when in the viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (isTabActive) {
            startCarouselAnimation();
          }
        } else {
          // Pause the animation when out of the viewport
          pauseCarouselAnimation();
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(carousel);

  // Page Visibility API to detect tab visibility
  document.addEventListener("visibilitychange", function () {
    isTabActive = document.visibilityState === "visible";

    if (isTabActive) {
      // Resume the animation if the tab becomes active
      resumeCarouselAnimation();
    } else {
      // Pause the animation if the tab becomes inactive
      pauseCarouselAnimation();
    }
  });

  // Function to start the carousel animation
  function startCarouselAnimation() {
    const keyframes = [{ transform: "translateX(0)" }, { transform: `translateX(-${carouselWidth}px)` }];

    const options = {
      duration: originalImages.length * 5000, // Adjust the duration based on the number of images
      iterations: Infinity, // Run the animation infinitely
    };

    animation = carousel.animate(keyframes, options);
    animationStartTime = performance.now();
  }

  // Function to pause the carousel animation
  function pauseCarouselAnimation() {
    if (animation) {
      animation.pause();
      animationPausedTime = performance.now() - animationStartTime;
    }
  }

  // Function to resume the carousel animation
  function resumeCarouselAnimation() {
    if (animation) {
      animation.play();
      animation.currentTime = animationPausedTime / 1000; // Convert milliseconds to seconds
      animationStartTime = performance.now() - animationPausedTime;
    }
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.querySelector(".carousel2");
  let isTabActive = true;
  let animation;
  let animationStartTime;
  let animationPausedTime = 0;

  // Set the width of the carousel container to fit all the images
  const originalImages = document.querySelectorAll(".carousel2 img");
  const carouselWidth = Array.from(originalImages).reduce((sum, img) => sum + img.clientWidth, 0);
  carousel.style.width = `${carouselWidth}px`;

  // Intersection Observer to start animation when in the viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (isTabActive) {
            startCarouselAnimation();
          }
        } else {
          // Pause the animation when out of the viewport
          pauseCarouselAnimation();
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(carousel);

  // Page Visibility API to detect tab visibility
  document.addEventListener("visibilitychange", function () {
    isTabActive = document.visibilityState === "visible";

    if (isTabActive) {
      // Resume the animation if the tab becomes active
      resumeCarouselAnimation();
    } else {
      // Pause the animation if the tab becomes inactive
      pauseCarouselAnimation();
    }
  });

  // Function to start the carousel animation
  function startCarouselAnimation() {
    const keyframes = [{ transform: "translateX(0)" }, { transform: `translateX(-${carouselWidth}px)` }];

    const options = {
      duration: originalImages.length * 5000, // Adjust the duration based on the number of images
      iterations: Infinity, // Run the animation infinitely
    };

    animation = carousel.animate(keyframes, options);
    animationStartTime = performance.now();
  }

  // Function to pause the carousel animation
  function pauseCarouselAnimation() {
    if (animation) {
      animation.pause();
      animationPausedTime = performance.now() - animationStartTime;
    }
  }

  // Function to resume the carousel animation
  function resumeCarouselAnimation() {
    if (animation) {
      animation.play();
      animation.currentTime = animationPausedTime / 1000; // Convert milliseconds to seconds
      animationStartTime = performance.now() - animationPausedTime;
    }
  }
});
