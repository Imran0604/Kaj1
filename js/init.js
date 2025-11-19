document.addEventListener('DOMContentLoaded', async function () {
  // Initialize Firebase first (initializeFirebase expected from firebase-config.js)
  if (typeof firebase !== 'undefined' && typeof initializeFirebase === 'function') {
    try {
      await initializeFirebase();
    } catch (error) {
      console.error('Firebase initialization failed:', error);
    }
  }

  // Then initialize other services/features
  if (window.initializeStripe) window.initializeStripe();
  if (window.testConnection) window.testConnection();
  if (window.initializePresetButtons) window.initializePresetButtons();
  if (window.checkCanceledPayment) window.checkCanceledPayment();
  if (window.smoothScroll) window.smoothScroll();
  if (window.initScrollEffects) window.initScrollEffects();
  if (window.initSlider) window.initSlider();

  console.log('Humanity First Foundation - Ready');
});

// Keep Google Sign-In on load to render button if present
window.addEventListener('load', function () {
  if (window.initializeGoogleSignIn) window.initializeGoogleSignIn();
});
