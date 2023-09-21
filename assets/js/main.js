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

// hideCursorArray.forEach((hideCurDiv) => hideCurDiv.addEventListener("mousemove", animateit));
// hideCursorArray.forEach((b) => b.addEventListener("mouseleave", animateit));
// window.addEventListener("mousemove", editCursor);

// (function () {
//   const link = document.querySelectorAll(".button > .hover-this");
//   const cursor = document.querySelector(".customCursor");

//   const animateit = function (e) {
//     const span = this.querySelector("span");
//     const { offsetX: x, offsetY: y } = e,
//       { offsetWidth: width, offsetHeight: height } = this,
//       move = 25,
//       xMove = (x / width) * (move * 2) - move,
//       yMove = (y / height) * (move * 2) - move;

//     span.style.transform = `translate(${xMove}px, ${yMove}px)`;

//     if (e.type === "mouseleave") span.style.transform = "";
//   };

//   const editCursor = (e) => {
//     const { clientX: x, clientY: y } = e;
//     cursor.style.left = x + "px";
//     cursor.style.top = y + "px";
//   };

//   link.forEach((b) => b.addEventListener("mousemove", animateit));
//   link.forEach((b) => b.addEventListener("mouseleave", animateit));
//   window.addEventListener("mousemove", editCursor);
// })();
