const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('#lightbox .lightbox-img');
const closeBtn = document.querySelector('#lightbox .close');

document.querySelectorAll('.image-container img, .employee-card img').forEach(img => {
  img.addEventListener('click', () => {
    lightbox.style.display = 'flex';
    lightboxImg.src = img.src;
    lightboxImg.style.transform = 'translate(0px,0px) scale(1)';
    scale = 1;
    posX = 0;
    posY = 0;
    isDragging = false;
  });
});

closeBtn.addEventListener('click', () => lightbox.style.display = 'none');

let isDragging = false;
let startX, startY, posX = 0, posY = 0;
let scale = 1;

lightboxImg.addEventListener('mousedown', (e) => {
  if(scale > 1){
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    lightboxImg.style.cursor = 'grabbing';
  }
});

lightboxImg.addEventListener('mouseup', () => {
  isDragging = false;
  lightboxImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
});

lightboxImg.addEventListener('mouseleave', () => {
  isDragging = false;
  lightboxImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
});

lightboxImg.addEventListener('mousemove', (e) => {
  if(!isDragging) return;
  posX = e.clientX - startX;
  posY = e.clientY - startY;
  lightboxImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
});

lightboxImg.addEventListener('click', () => {
  scale = scale === 1 ? 2 : 1;
  posX = 0;
  posY = 0;
  lightboxImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  lightboxImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
});