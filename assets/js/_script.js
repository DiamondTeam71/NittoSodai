document.addEventListener('DOMContentLoaded', function () {
  const profileBtnEl = document.getElementById('profile-btn');
  const popupMenuEl = document.getElementById('profile-popup');
  const enBtn = document.getElementById('en-btn');
  const bnBtn = document.getElementById('bn-btn');
  const contactBtnEl = document.querySelector('.contact-btn');
  const contactMenuEl = document.querySelector('.contact-menu');
  const track = document.querySelector('.slider-track');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  let currentIndex = 0;
  let startX = 0;
  let isDragging = false;

  profileBtnEl.addEventListener('click', e => {
    e.preventDefault();
    popupMenuEl.style.display = popupMenuEl.style.display === 'flex' ? 'none' : 'flex';
  });

  document.addEventListener('click', e => {
    if (!profileBtnEl.contains(e.target) && !popupMenuEl.contains(e.target)) {
      popupMenuEl.style.display = 'none';
    }
  });

  function setActiveBtn(activeBtn) {
    bnBtn.classList.remove('active');
    enBtn.classList.remove('active');
    activeBtn.classList.add('active');
  }

  bnBtn.addEventListener('click', e => {
    e.preventDefault();
    setActiveBtn(bnBtn);
    popupMenuEl.style.display = 'none';
    window.location.href = '#';
  });

  enBtn.addEventListener('click', e => {
    e.preventDefault();
    setActiveBtn(enBtn);
    popupMenuEl.style.display = 'none';
    window.location.href =
      'https://translate.google.com/translate?sl=auto&tl=en&u=' +
      encodeURIComponent(window.location.href);
  });

  document.getElementById('seller-btn').addEventListener('click', e => {
    e.preventDefault();
    popupMenuEl.style.display = 'none';
    window.location.href = 'NittoSodaiAbout.html';
  });

  contactBtnEl.addEventListener('click', e => {
    e.stopPropagation();
    contactMenuEl.classList.toggle('active');
  });

  document.addEventListener('click', e => {
    if (!contactMenuEl.contains(e.target)) {
      contactMenuEl.classList.remove('active');
    }
  });

  function updateSlide() {
    track.style.transition = 'transform 0.5s ease';
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentIndex].classList.add('active');
  }

  updateSlide();

  let slideInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlide();
  }, 3000);

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      currentIndex = idx;
      updateSlide();
      clearInterval(slideInterval);
      slideInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlide();
      }, 3000);
    });
  });

  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    isDragging = true;
    track.style.transition = 'none';
  });

  track.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const moveX = e.touches[0].clientX - startX;
    track.style.transform = `translateX(${-currentIndex * 100 + (moveX / slides[0].clientWidth) * 100}%)`;
  });

  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = e.changedTouches[0].clientX - startX;
    if (diff > 50) currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    else if (diff < -50) currentIndex = (currentIndex + 1) % slides.length;
    updateSlide();
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlide();
    }, 3000);
  });

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countSpan = document.getElementById('cart-count');
    const totalQty = cart.reduce((sum, item) => sum + (parseInt(item.qty) || 1), 0);
    countSpan.style.display = totalQty > 0 ? 'inline-block' : 'none';
    countSpan.textContent = totalQty;
  }

  function addToCart(item) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }

  function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }

  updateCartCount();
});
