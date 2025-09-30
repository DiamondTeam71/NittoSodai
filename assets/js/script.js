const track = document.querySelector('.slider-track');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let currentIndex = 0;
let startX = 0;
let isDragging = false;

function updateSlide(){
  track.style.transition = 'transform 0.5s ease';
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  dots.forEach(dot => dot.classList.remove('active'));
  dots[currentIndex].classList.add('active');
}

let slideInterval = setInterval(() => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateSlide();
}, 2000);

dots.forEach((dot, idx) => {
  dot.addEventListener('click', () => {
    currentIndex = idx;
    updateSlide();
    clearInterval(slideInterval);
    slideInterval = setInterval(() => { currentIndex = (currentIndex + 1) % slides.length; updateSlide(); }, 2000);
  });
});

track.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  isDragging = true;
  track.style.transition = 'none';
});

track.addEventListener('touchmove', e => {
  if(!isDragging) return;
  const moveX = e.touches[0].clientX - startX;
  track.style.transform = `translateX(${-currentIndex * 100 + moveX/slides[0].clientWidth*100}%)`;
});

track.addEventListener('touchend', e => {
  if(!isDragging) return;
  isDragging = false;
  const endX = e.changedTouches[0].clientX;
  const diff = endX - startX;
  if(diff > 50) currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  else if(diff < -50) currentIndex = (currentIndex + 1) % slides.length;
  updateSlide();
  clearInterval(slideInterval);
  slideInterval = setInterval(() => { currentIndex = (currentIndex + 1) % slides.length; updateSlide(); }, 2000);
});

const contactMenu = document.querySelector('.contact-menu');
const contactBtn = document.querySelector('.contact-btn');

contactBtn.addEventListener('click', () => {
  contactMenu.classList.toggle('active');
});

// এই কোডের কোনো অংশ হুবহু বা দেখতে প্রায় এমন তৈরি করলে তা নকল হিসেবে গণ্য হবে। একমাত্র Xrabon Programmer ছাড়া কেউই এইরম নকশা বা ডিজাইন তৈরি করতে পারবে না!

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countSpan = document.getElementById('cart-count');
    const totalQty = cart.reduce((sum, item) => sum + (parseInt(item.qty)||1), 0);
    
    if(totalQty > 0){
        countSpan.style.display = 'inline-block';
        countSpan.textContent = totalQty;
    } else {
        countSpan.style.display = 'none';
    }
}

updateCartCount();

function addToCart(item){
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function removeFromCart(index){
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}