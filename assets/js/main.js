const cursor = document.querySelector('cursor-fancy');


const positionElement = (e)=> {
  const mouseY = e.clientY;
  const mouseX = e.clientX;

  cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
}

window.addEventListener('mousemove', positionElement)