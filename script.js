// Direct Stripe Checkout Link (No Backend Required)
// NOTE: Payment Links can't receive arbitrary amount via query string.
// Option A: Use a single link and let donors enter amount on Stripe.
// Option B (recommended): Create per-amount links below and we’ll route accordingly.
const DEFAULT_STRIPE_PAYMENT_LINK = 'https://donate.stripe.com/test_6oU9ATgtO0580LTeNP2kw00';
// Alias to fix reference error in buildStripeUrl
const STRIPE_CHECKOUT_URL = DEFAULT_STRIPE_PAYMENT_LINK;

// Map popular amounts to their own Payment Links (replace with your real links if you create them)
const PAYMENT_LINKS = {
    // 25: 'https://donate.stripe.com/your_25_link',
    // 50: 'https://donate.stripe.com/your_50_link',
    // 100: 'https://donate.stripe.com/your_100_link',
    // 250: 'https://donate.stripe.com/your_250_link',
    // 500: 'https://donate.stripe.com/your_500_link'
};

// Google Sign-In Configuration (Optional)
let googleUser = null;
// Prevent double navigation
let isNavigatingToStripe = false;

window.onload = function() {
    initializeGoogleSignIn();
    smoothScroll();
    initScrollEffects();
};

// Initialize Google Sign-In (Optional)
function initializeGoogleSignIn() {
    if (typeof google !== 'undefined' && document.getElementById('googleSignInDiv')) {
        try {
            google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com',
                callback: handleGoogleSignIn
            });
            
            google.accounts.id.renderButton(
                document.getElementById('googleSignInDiv'),
                { 
                    theme: 'outline', 
                    size: 'large',
                    text: 'signin_with',
                    width: 250
                }
            );
        } catch (error) {
            console.log('Google Sign-In not configured');
        }
    }
}

// Handle Google Sign-In
function handleGoogleSignIn(response) {
    const userData = parseJwt(response.credential);
    googleUser = {
        name: userData.name,
        email: userData.email,
        picture: userData.picture
    };
    
    document.getElementById('donorName').value = googleUser.name;
    document.getElementById('donorEmail').value = googleUser.email;
    
    showNotification(`Welcome ${googleUser.name}!`, 'success');
}

// Parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Smooth Scrolling
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navLinks = document.getElementById('navLinks');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });
}

// Scroll effects
function initScrollEffects() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* Nav: mobile toggle */
function toggleMenu() {
  const nav = document.getElementById('navLinks');
  if (!nav) return;
  nav.classList.toggle('open');
}

/* Modal controls */
function openDonateModal(type) {
  const modal = document.getElementById('donateModal');
  if (modal) modal.classList.add('open');
  if (type) {
    const sel = document.getElementById('donationType');
    if (sel) sel.value = type;
  }
}
function closeDonateModal() {
  const modal = document.getElementById('donateModal');
  if (modal) modal.classList.remove('open');
}

/* Section helpers */
function viewProjects(slug) {
  // ...existing code...
  // Fallback: scroll to projects
  const el = document.getElementById('projects');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
function donateToCampaign(campaign) {
  // ...existing code...
  openDonateModal();
}

/* Monthly quick action */
function openMonthlyDonation() {
  openDonateModal('monthly');
}

/* Stripe checkout handoff (replace with your backend endpoint/session) */
let stripe;

// Initialize Stripe
async function initializeStripe() {
    try {
        const response = await fetch('get-stripe-key.php');
        const data = await response.json();
        stripe = Stripe(data.publishableKey);
    } catch (error) {
        console.error('Error initializing Stripe:', error);
    }
}

// Test PHP connection
async function testConnection() {
    try {
        const response = await fetch('test-connection.php');
        const data = await response.json();
        console.log('Connection test:', data);
        return true;
    } catch (error) {
        console.error('Connection test failed:', error);
        return false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeStripe();
    testConnection();
    initializePresetButtons();
    checkCanceledPayment();
    console.log('Humanity First Foundation - Ready');
});

// Initialize preset amount buttons
function initializePresetButtons() {
    const presetButtons = document.querySelectorAll('.preset-buttons button');
    const amountInput = document.querySelector('.quick-donate-container input[type="number"]');
    
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            presetButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update amount input
            const amount = this.getAttribute('data-amount');
            if (amountInput) {
                amountInput.value = amount;
            }
        });
    });
    
    // Also update button states when user types in the input
    if (amountInput) {
        amountInput.addEventListener('input', function() {
            const inputValue = this.value;
            let matchFound = false;
            
            presetButtons.forEach(btn => {
                const btnAmount = btn.getAttribute('data-amount');
                if (btnAmount === inputValue) {
                    btn.classList.add('active');
                    matchFound = true;
                } else {
                    btn.classList.remove('active');
                }
            });
        });
    }
}

// Check for canceled payment parameter
function checkCanceledPayment() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('canceled') === 'true') {
        alert('Donation canceled. No charges were made to your account.');
        // Remove the canceled parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Handle quick donate form
async function handleQuickDonate(event) {
    event.preventDefault();
    
    const form = event.target;
    const currency = form.querySelector('#currencySelect').value;
    const amountInput = form.querySelector('input[type="number"]').value;
    const purposeSelect = form.querySelector('select[aria-label="Donation Purpose"]');
    const purpose = purposeSelect ? purposeSelect.value : 'General Fund';
    
    // Get active preset button amount if input is empty
    let amount = parseFloat(amountInput);
    if (!amount || isNaN(amount)) {
        const activeBtn = form.querySelector('.preset-buttons button.active');
        if (activeBtn) {
            amount = parseFloat(activeBtn.getAttribute('data-amount'));
        }
    }
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid donation amount');
        return;
    }
    
    console.log('Quick donate data:', { amount, currency, purpose });
    
    await createCheckoutSession({
        amount: amount,
        currency: currency,
        donationType: purpose.toLowerCase().replace(/\s+/g, '-'),
        donorName: '',
        donorEmail: ''
    });
}

// Process donation from modal
async function processDonation(event) {
    event.preventDefault();
    
    const donationType = document.getElementById('donationType').value;
    const currency = document.getElementById('modalCurrency').value;
    const amount = document.getElementById('modalAmount').value;
    const donorName = document.getElementById('donorName').value;
    const donorEmail = document.getElementById('donorEmail').value;
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid donation amount');
        return;
    }
    
    await createCheckoutSession({
        amount: parseFloat(amount),
        currency: currency,
        donationType: donationType,
        donorName: donorName,
        donorEmail: donorEmail
    });
}

// Create Stripe checkout session
async function createCheckoutSession(data) {
    try {
        console.log('Creating checkout session with:', data);
        
        // Use relative URL
        const response = await fetch('./create-checkout-session.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Log response details
        console.log('Response status:', response.status);
        console.log('Response OK:', response.ok);
        
        // Get response text first
        const text = await response.text();
        console.log('Raw response:', text);
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} - ${text || 'No response body'}`);
        }
        
        // Try to parse JSON
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error('JSON parse error:', e);
            throw new Error('Invalid JSON response from server. Raw response: ' + text);
        }
        
        console.log('Parsed response:', result);
        
        if (result.error) {
            alert('Error: ' + result.error);
            return;
        }
        
        if (!result.id) {
            alert('Error: No session ID received');
            return;
        }
        
        // Check if stripe is initialized
        if (!stripe) {
            await initializeStripe();
            // Wait a moment for stripe to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!stripe) {
            throw new Error('Stripe failed to initialize');
        }
        
        // Redirect to Stripe Checkout
        const stripeResult = await stripe.redirectToCheckout({
            sessionId: result.id
        });
        
        if (stripeResult.error) {
            alert(stripeResult.error.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again. Error: ' + error.message);
    }
}

/* Optional: close modal on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDonateModal();
});

/* Optional: smooth-scroll for same-page nav links */
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

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeDonateModal();
    }
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Image Slider Functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function goToSlide(index) {
  // Remove active class from all slides and dots
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  // Add active class to current slide and dot
  currentSlide = index;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  goToSlide(currentSlide);
}

// Auto-advance slides every 5 seconds
let sliderInterval = setInterval(nextSlide, 5000);

// Pause auto-advance on hover
const sliderContainer = document.querySelector('.slider-container');
if (sliderContainer) {
  sliderContainer.addEventListener('mouseenter', () => {
    clearInterval(sliderInterval);
  });
  
  sliderContainer.addEventListener('mouseleave', () => {
    sliderInterval = setInterval(nextSlide, 5000);
  });
}
