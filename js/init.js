document.addEventListener("DOMContentLoaded", async function () {
  // Initialize Firebase first (initializeFirebase expected from firebase-config.js)
  if (
    typeof firebase !== "undefined" &&
    typeof initializeFirebase === "function"
  ) {
    try {
      await initializeFirebase();
    } catch (error) {
      console.error("Firebase initialization failed:", error);
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

  console.log("Humanity First Foundation - Ready");
});

// Keep Google Sign-In on load to render button if present
window.addEventListener("load", function () {
  if (window.initializeGoogleSignIn) window.initializeGoogleSignIn();
});

document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".giving-basket-carousel");
  const prevBtn = document.querySelector(".prev-arrow");
  const nextBtn = document.querySelector(".next-arrow");
  const scrollAmount = 310; // Card width (280px) + gap (30px)

  prevBtn.addEventListener("click", () => {
    carousel.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
  });

  nextBtn.addEventListener("click", () => {
    carousel.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  });
});
