// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        const isHash = href && href.startsWith('#');
        if (isHash) e.preventDefault();
        const target = isHash ? document.querySelector(href) : null;
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
        // Close mobile nav after click
        const header = document.querySelector('header');
        const toggle = document.querySelector('.menu-toggle');
        if (header?.classList.contains('nav-open')) {
            header.classList.remove('nav-open');
            toggle?.setAttribute('aria-expanded', 'false');
        }
    });
});

// Mobile menu toggle
const toggleBtn = document.querySelector('.menu-toggle');
toggleBtn?.addEventListener('click', () => {
    const header = document.querySelector('header');
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    header.classList.toggle('nav-open');
    toggleBtn.setAttribute('aria-expanded', (!expanded).toString());
});

// Simple back-to-top button
const backToTop = document.createElement('button');
backToTop.textContent = '↑ Top';
backToTop.style.position = 'fixed';
backToTop.style.bottom = '20px';
backToTop.style.right = '20px';
backToTop.style.padding = '10px 15px';
backToTop.style.fontSize = '18px';
backToTop.style.border = 'none';
backToTop.style.borderRadius = '8px';
backToTop.style.background = 'linear-gradient(to right, #ff7e5f, #feb47b)';
backToTop.style.color = '#fff';
backToTop.style.cursor = 'pointer';
backToTop.style.display = 'none';
backToTop.setAttribute('aria-label', 'Back to top');
document.body.appendChild(backToTop);

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
    backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
});

// Simple image slider for placeholders
function createSlider(sectionId, images = []) {
    const section = document.getElementById(sectionId);
    if (!section || !images.length) return;

    const slider = document.createElement('div');
    slider.style.position = 'relative';
    slider.style.overflow = 'hidden';
    slider.style.height = '250px';
    slider.style.marginBottom = '20px';

    const imgContainer = document.createElement('div');
    imgContainer.style.display = 'flex';
    imgContainer.style.transition = 'transform 0.5s ease-in-out';
    slider.appendChild(imgContainer);

    images.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Slide image';
        img.style.width = '100%';
        img.style.flexShrink = '0';
        imgContainer.appendChild(img);
    });

    section.insertBefore(slider, section.firstChild);

    let currentIndex = 0;
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        imgContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    }, 3000);
}

// Initialize sliders for different sections
createSlider('programs', ['https://via.placeholder.com/800x250', 'https://via.placeholder.com/800x250/aaa']);
createSlider('campaigns', ['https://via.placeholder.com/800x250/ccc', 'https://via.placeholder.com/800x250/ddd']);
createSlider('ways-to-give', ['https://via.placeholder.com/800x250/eee', 'https://via.placeholder.com/800x250/999']);
createSlider('rapid-response', ['https://via.placeholder.com/800x250/f99', 'https://via.placeholder.com/800x250/9f9']);
createSlider('medical-aid', ['https://via.placeholder.com/800x250/99f', 'https://via.placeholder.com/800x250/ff9']);
createSlider('education', ['https://via.placeholder.com/800x250/f9f', 'https://via.placeholder.com/800x250/9ff']);

// Active nav link highlighting on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 90;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});
