// main.js

// set year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// simple nav toggle for mobile
const toggle = document.querySelector('.nav-toggle');
toggle?.addEventListener('click', () => {
  const links = document.querySelector('.nav-links');
  if (!links) return;
  if (links.style.display === 'flex') links.style.display = 'none';
  else links.style.display = 'flex';
});

// tsParticles config with heart + circle particles and subtle links
tsParticles.load("particle-bg", {
  fullScreen: { enable: false },
  detectRetina: true,
  fpsLimit: 60,
  particles: {
    number: { value: 40, density: { enable: true, area: 900 } },
    color: { value: ["#e94b3c", "#ff8a65", "#ffd166"] },
    shape: {
      type: ["circle", "image"],
      image: [
        // small heart SVG as image particle (data URL)
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 29'%3E%3Cpath fill='%23e94b3c' d='M23.6 0c-3 0-4.7 1.7-5.6 2.9-.9-1.2-2.6-2.9-5.6-2.9C5.1 0 0 4.9 0 10.9 0 18 8.8 24 16 29c7.2-5 16-11 16-18.1C32 4.9 26.9 0 23.6 0z'/%3E%3C/svg%3E",
          width: 16,
          height: 14
        }
      ]
    },
    opacity: { value: 0.85, random: true },
    size: { value: { min: 6, max: 20 }, random: true },
    move: {
      enable: true,
      speed: 0.9,
      direction: "none",
      random: true,
      straight: false,
      outModes: { default: "out" },
      attract: { enable: false }
    },
    links: {
      enable: true,
      distance: 130,
      color: "#e0e6ee",
      opacity: 0.18,
      width: 1
    }
  },
  interactivity: {
    detectsOn: "canvas",
    events: {
      onHover: { enable: true, mode: "repulse" },
      onClick: { enable: true, mode: "push" },
      resize: true
    },
    modes: {
      grab: { distance: 200, links: { opacity: 0.2 } },
      bubble: { distance: 200, size: 8, duration: 2, opacity: 0.8 },
      repulse: { distance: 120 },
      push: { quantity: 4 },
      remove: { quantity: 2 }
    }
  }
});
