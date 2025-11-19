(function () {
  function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const sliderContainer = document.querySelector('.slider-container');
    if (!slides.length || !sliderContainer) return;

    let currentSlide = 0;

    function goToSlide(index) {
      slides.forEach(s => s.classList.remove('active'));
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
    }
    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    let sliderInterval = setInterval(nextSlide, 5000);

    sliderContainer.addEventListener('mouseenter', () => clearInterval(sliderInterval));
    sliderContainer.addEventListener('mouseleave', () => {
      clearInterval(sliderInterval);
      sliderInterval = setInterval(nextSlide, 5000);
    });

    const prevBtn = sliderContainer.querySelector('.slider-arrow.prev');
    const nextBtn = sliderContainer.querySelector('.slider-arrow.next');
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  }

  window.initSlider = initSlider;
})();
