(function () {
  function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();

        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

        const navLinks = document.getElementById('navLinks');
        if (navLinks && navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
        }
      });
    });
  }

  function initScrollEffects() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    });
  }

  function toggleMenu() {
    const nav = document.getElementById('navLinks');
    if (!nav) return;
    nav.classList.toggle('open');
  }

  // Extra: document-level smooth scroll for same-page anchors
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href')?.slice(1);
    const target = id && document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', `#${id}`);
    }
  });

  window.smoothScroll = smoothScroll;
  window.initScrollEffects = initScrollEffects;
  window.toggleMenu = toggleMenu;
})();
