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
  // Fallback: scroll to projects
  const el = document.getElementById('projects');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
function donateToCampaign(campaign) {
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

// Update DOMContentLoaded to initialize Firebase
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Firebase first
    if (typeof firebase !== 'undefined') {
        try {
            await initializeFirebase();
        } catch (error) {
            console.error('Firebase initialization failed:', error);
        }
    }
    
    // Then initialize other services
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
        showCancelNotification();
        // Remove the canceled parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Show cancellation notification
function showCancelNotification() {
    const notification = document.createElement('div');
    notification.className = 'cancel-notification';
    notification.innerHTML = `
        <div class="cancel-notification-content">
            <span class="cancel-icon">ℹ️</span>
            <div class="cancel-text">
                <strong>Donation Canceled</strong>
                <p>No charges were made to your account.</p>
            </div>
            <button class="cancel-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
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
    
    .cancel-notification {
        position: fixed;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border-left: 4px solid #0b6d47;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        border-radius: 8px;
        z-index: 10000;
        transition: top 0.3s ease;
        max-width: 500px;
        width: 90%;
    }
    
    .cancel-notification.show {
        top: 20px;
    }
    
    .cancel-notification-content {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 20px;
    }
    
    .cancel-icon {
        font-size: 24px;
        flex-shrink: 0;
    }
    
    .cancel-text {
        flex: 1;
    }
    
    .cancel-text strong {
        display: block;
        color: #333;
        font-size: 16px;
        margin-bottom: 5px;
    }
    
    .cancel-text p {
        color: #666;
        font-size: 14px;
        margin: 0;
    }
    
    .cancel-close {
        background: none;
        border: none;
        font-size: 28px;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
        flex-shrink: 0;
    }
    
    .cancel-close:hover {
        background: #f5f5f5;
        color: #333;
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

// Search functionality
let searchModal = null;
let searchResults = [];

function toggleSearch() {
    if (!searchModal) {
        createSearchModal();
    }
    searchModal.classList.toggle('active');
    if (searchModal.classList.contains('active')) {
        document.getElementById('searchInput').focus();
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
        clearSearchResults();
    }
}

function createSearchModal() {
    searchModal = document.createElement('div');
    searchModal.className = 'search-modal';
    searchModal.innerHTML = `
        <div class="search-modal-overlay" onclick="toggleSearch()"></div>
        <div class="search-modal-content">
            <div class="search-header">
                <div class="search-input-container">
                    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input 
                        type="text" 
                        id="searchInput" 
                        placeholder="Search programs, campaigns, or content..." 
                        autocomplete="off"
                    >
                    <button class="search-close" onclick="toggleSearch()" aria-label="Close search">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="search-body">
                <div id="searchResultsContainer" class="search-results"></div>
                <div id="searchEmptyState" class="search-empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>Type to search programs, campaigns, or content</p>
                </div>
                <div id="searchNoResults" class="search-no-results" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>No results found</p>
                    <small>Try different keywords</small>
                </div>
            </div>
            <div class="search-footer">
                <div class="search-tips">
                    <span class="search-tip"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                    <span class="search-tip"><kbd>Enter</kbd> Select</span>
                    <span class="search-tip"><kbd>Esc</kbd> Close</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(searchModal);
    
    // Add search input listener
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Add keyboard navigation
    searchInput.addEventListener('keydown', handleSearchKeyboard);
}

function handleSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('searchResultsContainer');
    const emptyState = document.getElementById('searchEmptyState');
    const noResults = document.getElementById('searchNoResults');
    
    if (!query) {
        clearSearchResults();
        return;
    }
    
    // Hide empty state
    emptyState.style.display = 'none';
    noResults.style.display = 'none';
    
    // Search through content
    searchResults = performSearch(query);
    
    if (searchResults.length === 0) {
        resultsContainer.innerHTML = '';
        noResults.style.display = 'flex';
        return;
    }
    
    // Display results
    displaySearchResults(searchResults);
}

function performSearch(query) {
    const results = [];
    
    // Search in programs
    const programCards = document.querySelectorAll('.program-card');
    programCards.forEach((card, index) => {
        const title = card.querySelector('h3')?.textContent || '';
        const description = card.querySelector('p')?.textContent || '';
        const icon = card.querySelector('.program-icon')?.textContent || '';
        
        if (title.toLowerCase().includes(query) || description.toLowerCase().includes(query)) {
            results.push({
                type: 'Program',
                title: title,
                description: description.substring(0, 150) + '...',
                icon: icon,
                section: 'programs',
                element: card
            });
        }
    });
    
    // Search in campaigns
    const campaignCards = document.querySelectorAll('.campaign-card');
    campaignCards.forEach((card, index) => {
        const title = card.querySelector('h3')?.textContent || '';
        const description = card.querySelector('p')?.textContent || '';
        
        if (title.toLowerCase().includes(query) || description.toLowerCase().includes(query)) {
            results.push({
                type: 'Campaign',
                title: title,
                description: description,
                icon: '🎯',
                section: 'campaigns',
                element: card
            });
        }
    });
    
    // Search in ways to give
    const givingCards = document.querySelectorAll('.giving-card');
    givingCards.forEach((card, index) => {
        const title = card.querySelector('h3')?.textContent || '';
        const description = card.querySelector('p')?.textContent || '';
        const icon = card.querySelector('.giving-icon')?.textContent || '';
        
        if (title.toLowerCase().includes(query) || description.toLowerCase().includes(query)) {
            results.push({
                type: 'Giving Option',
                title: title,
                description: description.substring(0, 150) + '...',
                icon: icon,
                section: 'ways-to-give',
                element: card
            });
        }
    });
    
    // Search in projects
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        const title = card.querySelector('h3')?.textContent || '';
        const description = card.querySelector('p')?.textContent || '';
        
        if (title.toLowerCase().includes(query) || description.toLowerCase().includes(query)) {
            results.push({
                type: 'Project',
                title: title,
                description: description,
                icon: '🏗️',
                section: 'projects',
                element: card
            });
        }
    });
    
    // Search in regions
    const regionCards = document.querySelectorAll('.region-card');
    regionCards.forEach((card, index) => {
        const text = card.textContent || '';
        
        if (text.toLowerCase().includes(query)) {
            results.push({
                type: 'Region',
                title: text,
                description: 'Where we work',
                icon: card.textContent.split(' ')[0],
                section: 'where-we-work',
                element: card
            });
        }
    });
    
    return results;
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResultsContainer');
    
    resultsContainer.innerHTML = results.map((result, index) => `
        <div class="search-result-item ${index === 0 ? 'active' : ''}" data-index="${index}" onclick="navigateToResult(${index})">
            <div class="search-result-icon">${result.icon}</div>
            <div class="search-result-content">
                <div class="search-result-header">
                    <h4>${highlightQuery(result.title, document.getElementById('searchInput').value)}</h4>
                    <span class="search-result-type">${result.type}</span>
                </div>
                <p>${highlightQuery(result.description, document.getElementById('searchInput').value)}</p>
            </div>
            <svg class="search-result-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
        </div>
    `).join('');
}

function highlightQuery(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function navigateToResult(index) {
    const result = searchResults[index];
    if (!result) return;
    
    // Close search modal
    toggleSearch();
    
    // Scroll to section
    const section = document.getElementById(result.section);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight the element briefly
        if (result.element) {
            setTimeout(() => {
                result.element.style.transition = 'all 0.3s ease';
                result.element.style.transform = 'scale(1.05)';
                result.element.style.boxShadow = '0 8px 30px rgba(26, 82, 69, 0.3)';
                
                setTimeout(() => {
                    result.element.style.transform = '';
                    result.element.style.boxShadow = '';
                }, 1000);
            }, 500);
        }
    }
}

function handleSearchKeyboard(event) {
    const resultItems = document.querySelectorAll('.search-result-item');
    const activeItem = document.querySelector('.search-result-item.active');
    let activeIndex = activeItem ? parseInt(activeItem.dataset.index) : -1;
    
    switch(event.key) {
        case 'ArrowDown':
            event.preventDefault();
            if (activeIndex < resultItems.length - 1) {
                activeIndex++;
                updateActiveResult(activeIndex);
            }
            break;
        case 'ArrowUp':
            event.preventDefault();
            if (activeIndex > 0) {
                activeIndex--;
                updateActiveResult(activeIndex);
            }
            break;
        case 'Enter':
            event.preventDefault();
            if (activeIndex >= 0) {
                navigateToResult(activeIndex);
            }
            break;
        case 'Escape':
            event.preventDefault();
            toggleSearch();
            break;
    }
}

function updateActiveResult(index) {
    const resultItems = document.querySelectorAll('.search-result-item');
    resultItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

function clearSearchResults() {
    const resultsContainer = document.getElementById('searchResultsContainer');
    const emptyState = document.getElementById('searchEmptyState');
    const noResults = document.getElementById('searchNoResults');
    const searchInput = document.getElementById('searchInput');
    
    if (resultsContainer) resultsContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (noResults) noResults.style.display = 'none';
    if (searchInput) searchInput.value = '';
    searchResults = [];
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Zakat Calculator functionality
let zakatModal = null;

function openZakatCalculator() {
    if (!zakatModal) {
        createZakatCalculatorModal();
    }
    zakatModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeZakatCalculator() {
    if (zakatModal) {
        zakatModal.classList.remove('active');
        document.body.style.overflow = '';
        resetZakatCalculator();
    }
}

function createZakatCalculatorModal() {
    zakatModal = document.createElement('div');
    zakatModal.className = 'zakat-modal';
    zakatModal.innerHTML = `
        <div class="modal-overlay" onclick="closeZakatCalculator()"></div>
        <div class="modal-content zakat-modal-content">
            <button class="modal-close" onclick="closeZakatCalculator()" aria-label="Close">&times;</button>
            
            <div class="modal-header">
                <h2>🕌 Zakat Calculator</h2>
                <p>Calculate your Zakat obligation with ease</p>
            </div>

            <div class="modal-body zakat-calculator-body">
                <!-- Nisab Reference -->
                <div class="nisab-reference">
                    <h3>Current Nisab Value</h3>
                    <div class="nisab-values">
                        <div class="nisab-item">
                            <span class="nisab-label">Gold (87.48g)</span>
                            <span class="nisab-value" id="nisabGold">$11,427.70</span>
                        </div>
                        <div class="nisab-item">
                            <span class="nisab-label">Silver (612.36g)</span>
                            <span class="nisab-value" id="nisabSilver">$990.66</span>
                        </div>
                    </div>
                    <p class="nisab-note">Zakat is 2.5% of wealth above Nisab threshold</p>
                </div>

                <!-- Calculator Form -->
                <form id="zakatCalculatorForm" class="zakat-form">
                    <!-- Cash & Bank Balances -->
                    <div class="zakat-section">
                        <h3>💰 Cash & Bank Balances</h3>
                        <div class="form-group">
                            <label>Cash at home</label>
                            <input type="number" class="zakat-input" id="cashHome" min="0" step="0.01" placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label>Bank accounts (checking/savings)</label>
                            <input type="number" class="zakat-input" id="bankAccounts" min="0" step="0.01" placeholder="0.00">
                        </div>
                    </div>

                    <!-- Gold & Silver -->
                    <div class="zakat-section">
                        <h3>✨ Gold & Silver</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Gold (grams)</label>
                                <input type="number" class="zakat-input" id="goldWeight" min="0" step="0.01" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label>Gold value ($)</label>
                                <input type="number" class="zakat-input" id="goldValue" min="0" step="0.01" placeholder="0.00" readonly>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Silver (grams)</label>
                                <input type="number" class="zakat-input" id="silverWeight" min="0" step="0.01" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label>Silver value ($)</label>
                                <input type="number" class="zakat-input" id="silverValue" min="0" step="0.01" placeholder="0.00" readonly>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Other precious metals/jewelry value</label>
                            <input type="number" class="zakat-input" id="otherPreciousMetals" min="0" step="0.01" placeholder="0.00">
                        </div>
                    </div>

                    <!-- Investments -->
                    <div class="zakat-section">
                        <h3>📈 Investments</h3>
                        <div class="form-group">
                            <label>Stocks & shares</label>
                            <input type="number" class="zakat-input" id="stocks" min="0" step="0.01" placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label>Business inventory & assets</label>
                            <input type="number" class="zakat-input" id="businessAssets" min="0" step="0.01" placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label>Investment properties (rental income value)</label>
                            <input type="number" class="zakat-input" id="investmentProperties" min="0" step="0.01" placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label>Retirement funds (401k, IRA, etc.)</label>
                            <input type="number" class="zakat-input" id="retirementFunds" min="0" step="0.01" placeholder="0.00">
                        </div>
                    </div>

                    <!-- Money Owed -->
                    <div class="zakat-section">
                        <h3>💵 Money Owed to You</h3>
                        <div class="form-group">
                            <label>Loans given to others (expected to be repaid)</label>
                            <input type="number" class="zakat-input" id="loansGiven" min="0" step="0.01" placeholder="0.00">
                        </div>
                    </div>

                    <!-- Liabilities -->
                    <div class="zakat-section">
                        <h3>📋 Liabilities (Deduct from total)</h3>
                        <div class="form-group">
                            <label>Debts due within the year</label>
                            <input type="number" class="zakat-input" id="debts" min="0" step="0.01" placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label>Unpaid bills & expenses</label>
                            <input type="number" class="zakat-input" id="unpaidBills" min="0" step="0.01" placeholder="0.00">
                        </div>
                    </div>

                    <button type="button" class="calculate-btn" onclick="calculateZakat()">
                        Calculate My Zakat
                    </button>
                </form>

                <!-- Results Section -->
                <div id="zakatResults" class="zakat-results" style="display: none;">
                    <h3>📊 Your Zakat Calculation</h3>
                    <div class="result-summary">
                        <div class="result-item">
                            <span class="result-label">Total Zakatable Wealth:</span>
                            <span class="result-value" id="totalWealth">$0.00</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Less Liabilities:</span>
                            <span class="result-value" id="totalLiabilities">$0.00</span>
                        </div>
                        <div class="result-item net-wealth">
                            <span class="result-label">Net Zakatable Wealth:</span>
                            <span class="result-value" id="netWealth">$0.00</span>
                        </div>
                        <div class="result-item zakat-due">
                            <span class="result-label">Zakat Due (2.5%):</span>
                            <span class="result-value zakat-amount" id="zakatDue">$0.00</span>
                        </div>
                    </div>
                    
                    <div id="zakatStatus" class="zakat-status"></div>
                    
                    <div class="result-actions">
                        <button class="pay-zakat-btn" onclick="payZakat()">
                            Pay Zakat Now
                        </button>
                        <button class="print-btn" onclick="printZakatReport()">
                            Print Report
                        </button>
                        <button class="reset-btn" onclick="resetZakatCalculator()">
                            Reset Calculator
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(zakatModal);
    
    // Add event listeners for automatic gold/silver value calculation
    setupZakatCalculatorListeners();
}

function setupZakatCalculatorListeners() {
    const goldPricePerGram = 57.0; // Approximate price per gram
    const silverPricePerGram = 0.57; // Approximate price per gram
    
    const goldWeightInput = document.getElementById('goldWeight');
    const goldValueInput = document.getElementById('goldValue');
    const silverWeightInput = document.getElementById('silverWeight');
    const silverValueInput = document.getElementById('silverValue');
    
    // Prevent negative values for all zakat inputs
    const zakatInputs = document.querySelectorAll('.zakat-input');
    zakatInputs.forEach(input => {
        input.addEventListener('keydown', function(e) {
            // Prevent minus sign
            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
            }
        });
        
        input.addEventListener('input', function() {
            // Remove negative values if somehow entered
            if (this.value < 0) {
                this.value = 0;
            }
        });
        
        input.addEventListener('blur', function() {
            // Ensure non-negative on blur
            if (this.value < 0 || this.value === '') {
                this.value = 0;
            }
        });
    });
    
    if (goldWeightInput) {
        goldWeightInput.addEventListener('input', function() {
            const weight = parseFloat(this.value) || 0;
            // Ensure non-negative
            if (weight < 0) {
                this.value = 0;
                goldValueInput.value = '0.00';
            } else {
                goldValueInput.value = (weight * goldPricePerGram).toFixed(2);
            }
        });
    }
    
    if (silverWeightInput) {
        silverWeightInput.addEventListener('input', function() {
            const weight = parseFloat(this.value) || 0;
            // Ensure non-negative
            if (weight < 0) {
                this.value = 0;
                silverValueInput.value = '0.00';
            } else {
                silverValueInput.value = (weight * silverPricePerGram).toFixed(2);
            }
        });
    }
}

function calculateZakat() {
    // Get all input values with validation
    const getPositiveValue = (id) => {
        const value = parseFloat(document.getElementById(id).value) || 0;
        return value < 0 ? 0 : value;
    };
    
    const cashHome = getPositiveValue('cashHome');
    const bankAccounts = getPositiveValue('bankAccounts');
    const goldValue = getPositiveValue('goldValue');
    const silverValue = getPositiveValue('silverValue');
    const otherPreciousMetals = getPositiveValue('otherPreciousMetals');
    const stocks = getPositiveValue('stocks');
    const businessAssets = getPositiveValue('businessAssets');
    const investmentProperties = getPositiveValue('investmentProperties');
    const retirementFunds = getPositiveValue('retirementFunds');
    const loansGiven = getPositiveValue('loansGiven');
    const debts = getPositiveValue('debts');
    const unpaidBills = getPositiveValue('unpaidBills');
    
    // Calculate totals
    const totalAssets = cashHome + bankAccounts + goldValue + silverValue + 
                        otherPreciousMetals + stocks + businessAssets + 
                        investmentProperties + retirementFunds + loansGiven;
    
    const totalLiabilities = debts + unpaidBills;
    const netWealth = Math.max(0, totalAssets - totalLiabilities); // Ensure non-negative
    const zakatDue = netWealth * 0.025; // 2.5%
    
    // Nisab threshold (using silver nisab as it's more beneficial for recipients)
    const nisabThreshold = 350; // Approximate silver nisab in USD
    
    // Display results
    document.getElementById('totalWealth').textContent = '$' + totalAssets.toFixed(2);
    document.getElementById('totalLiabilities').textContent = '$' + totalLiabilities.toFixed(2);
    document.getElementById('netWealth').textContent = '$' + netWealth.toFixed(2);
    document.getElementById('zakatDue').textContent = '$' + zakatDue.toFixed(2);
    
    // Show status message
    const statusDiv = document.getElementById('zakatStatus');
    if (netWealth >= nisabThreshold) {
        statusDiv.innerHTML = `
            <div class="status-success">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>Your wealth is above the Nisab threshold. Zakat is due: <strong>$${zakatDue.toFixed(2)}</strong></p>
            </div>
        `;
    } else {
        statusDiv.innerHTML = `
            <div class="status-info">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <p>Your wealth is below the Nisab threshold. Zakat is not obligatory at this time.</p>
            </div>
        `;
    }
    
    // Show results section
    document.getElementById('zakatResults').style.display = 'block';
    
    // Scroll to results
    document.getElementById('zakatResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function payZakat() {
    const zakatAmount = parseFloat(document.getElementById('zakatDue').textContent.replace('$', ''));
    
    if (zakatAmount <= 0) {
        alert('No Zakat amount to pay');
        return;
    }
    
    // Close zakat calculator
    closeZakatCalculator();
    
    // Open donation modal with zakat amount pre-filled
    setTimeout(() => {
        openDonateModal('zakat');
        const modalAmount = document.getElementById('modalAmount');
        if (modalAmount) {
            modalAmount.value = zakatAmount.toFixed(2);
        }
    }, 300);
}

function printZakatReport() {
    const totalWealth = document.getElementById('totalWealth').textContent;
    const totalLiabilities = document.getElementById('totalLiabilities').textContent;
    const netWealth = document.getElementById('netWealth').textContent;
    const zakatDue = document.getElementById('zakatDue').textContent;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Zakat Calculation Report</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                h1 {
                    color: #1a5245;
                    text-align: center;
                    margin-bottom: 30px;
                }
                .report-date {
                    text-align: right;
                    color: #666;
                    margin-bottom: 30px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background: #f5f5f5;
                    font-weight: bold;
                }
                .total-row {
                    font-weight: bold;
                    background: #f9f9f9;
                }
                .zakat-due {
                    background: #1a5245;
                    color: white;
                    font-size: 1.2em;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #1a5245;
                    text-align: center;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <h1>🕌 Zakat Calculation Report</h1>
            <div class="report-date">Date: ${new Date().toLocaleDateString()}</div>
            <table>
                <tr>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
                <tr class="total-row">
                    <td>Total Zakatable Wealth</td>
                    <td>${totalWealth}</td>
                </tr>
                <tr>
                    <td>Less: Liabilities</td>
                    <td>${totalLiabilities}</td>
                </tr>
                <tr class="total-row">
                    <td>Net Zakatable Wealth</td>
                    <td>${netWealth}</td>
                </tr>
                <tr class="zakat-due">
                    <td>Zakat Due (2.5%)</td>
                    <td>${zakatDue}</td>
                </tr>
            </table>
            <div class="footer">
                <p>Humanity First Foundation</p>
                <p>This is a computer-generated report for your personal records.</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function resetZakatCalculator() {
    const form = document.getElementById('zakatCalculatorForm');
    if (form) {
        form.reset();
    }
    const results = document.getElementById('zakatResults');
    if (results) {
        results.style.display = 'none';
    }
}

/* Login Modal functionality */
let loginModal = null;
let currentUser = null;

function openLogin() {
    if (!loginModal) {
        createLoginModal();
    }
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLogin() {
    if (loginModal) {
        loginModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function createLoginModal() {
    loginModal = document.createElement('div');
    loginModal.className = 'login-modal';
    loginModal.innerHTML = `
        <div class="modal-overlay" onclick="closeLogin()"></div>
        <div class="modal-content login-modal-content">
            <button class="modal-close" onclick="closeLogin()" aria-label="Close">&times;</button>
            
            <div class="modal-header">
                <h2>👤 Sign In</h2>
                <p>Access your account to track donations and save preferences</p>
            </div>

            <div class="modal-body">
                <!-- Tab Navigation -->
                <div class="login-tabs">
                    <button class="login-tab active" onclick="switchLoginTab('signin')">Sign In</button>
                    <button class="login-tab" onclick="switchLoginTab('signup')">Sign Up</button>
                </div>

                <!-- Sign In Form -->
                <form id="signInForm" class="login-form" style="display: block;">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="signInEmail" class="form-control" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="signInPassword" class="form-control" placeholder="••••••••" required>
                    </div>
                    <div class="form-actions">
                        <label class="remember-me">
                            <input type="checkbox" id="rememberMe">
                            <span>Remember me</span>
                        </label>
                        <a href="#" class="forgot-password" onclick="handleForgotPassword(); return false;">Forgot password?</a>
                    </div>
                    <button type="submit" class="auth-btn" onclick="handleSignIn(event)">
                        Sign In
                    </button>
                    <div class="divider"><span>OR</span></div>
                    <button type="button" class="google-auth-btn" onclick="handleGoogleSignIn()">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>
                </form>

                <!-- Sign Up Form -->
                <form id="signUpForm" class="login-form" style="display: none;">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="signUpName" class="form-control" placeholder="John Doe" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="signUpEmail" class="form-control" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="signUpPassword" class="form-control" placeholder="Min. 6 characters" required>
                    </div>
                    <div class="form-group">
                        <label>Confirm Password</label>
                        <input type="password" id="signUpPasswordConfirm" class="form-control" placeholder="Confirm password" required>
                    </div>
                    <button type="submit" class="auth-btn" onclick="handleSignUp(event)">
                        Create Account
                    </button>
                    <div class="divider"><span>OR</span></div>
                    <button type="button" class="google-auth-btn" onclick="handleGoogleSignIn()">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign up with Google
                    </button>
                </form>

                <!-- User Profile (shown when logged in) -->
                <div id="userProfile" class="user-profile" style="display: none;">
                    <div class="profile-header">
                        <div class="profile-avatar" id="userAvatar">
                            <span id="userInitial">U</span>
                        </div>
                        <div class="profile-info">
                            <h3 id="userName">User Name</h3>
                            <p id="userEmail">user@email.com</p>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button class="profile-btn" onclick="viewDonationHistory()">
                            📜 Donation History
                        </button>
                        <button class="profile-btn" onclick="editProfile()">
                            ✏️ Edit Profile
                        </button>
                        <button class="profile-btn logout-btn" onclick="handleSignOut()">
                            🚪 Sign Out
                        </button>
                    </div>
                </div>

                <div id="authMessage" class="auth-message"></div>
            </div>
        </div>
    `;
    document.body.appendChild(loginModal);
    
    // Initialize auth state listener
    initializeAuthListener();
}

function switchLoginTab(tab) {
    const tabs = document.querySelectorAll('.login-tab');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'signin') {
        tabs[0].classList.add('active');
        signInForm.style.display = 'block';
        signUpForm.style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        signInForm.style.display = 'none';
        signUpForm.style.display = 'block';
    }
}

async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
        showAuthMessage('Signing in...', 'info');
        
        const persistence = rememberMe ? 
            firebase.auth.Auth.Persistence.LOCAL : 
            firebase.auth.Auth.Persistence.SESSION;
        
        await firebaseAuth.setPersistence(persistence);
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        
        showAuthMessage('Successfully signed in!', 'success');
        
        // Update UI
        updateUIForUser(userCredential.user);
        
        // Close modal after delay
        setTimeout(() => closeLogin(), 1000);
        
    } catch (error) {
        console.error('Sign in error:', error);
        showAuthMessage(getErrorMessage(error.code), 'error');
    }
}

async function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpPasswordConfirm').value;
    
    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        showAuthMessage('Creating account...', 'info');
        
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        
        // Update profile with name
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        showAuthMessage('Account created successfully!', 'success');
        
        // Update UI
        updateUIForUser(userCredential.user);
        
        // Close modal after delay
        setTimeout(() => closeLogin(), 1000);
        
    } catch (error) {
        console.error('Sign up error:', error);
        showAuthMessage(getErrorMessage(error.code), 'error');
    }
}

async function handleGoogleSignIn() {
    try {
        showAuthMessage('Redirecting to Google...', 'info');
        
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebaseAuth.signInWithPopup(provider);
        
        showAuthMessage('Successfully signed in with Google!', 'success');
        
        // Update UI
        updateUIForUser(result.user);
        
        // Close modal after delay
        setTimeout(() => closeLogin(), 1000);
        
    } catch (error) {
        console.error('Google sign in error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            showAuthMessage(getErrorMessage(error.code), 'error');
        }
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('signInEmail').value;
    
    if (!email) {
        showAuthMessage('Please enter your email address first', 'error');
        return;
    }
    
    try {
        await firebaseAuth.sendPasswordResetEmail(email);
        showAuthMessage('Password reset email sent! Check your inbox.', 'success');
    } catch (error) {
        console.error('Password reset error:', error);
        showAuthMessage(getErrorMessage(error.code), 'error');
    }
}

async function handleSignOut() {
    try {
        await firebaseAuth.signOut();
        showAuthMessage('Signed out successfully', 'success');
        
        // Update UI
        updateUIForSignedOut();
        
        // Close modal after delay
        setTimeout(() => closeLogin(), 1000);
        
    } catch (error) {
        console.error('Sign out error:', error);
        showAuthMessage('Error signing out', 'error');
    }
}

function initializeAuthListener() {
    firebaseAuth.onAuthStateChanged((user) => {
        currentUser = user;
        
        if (user) {
            updateUIForUser(user);
        } else {
            updateUIForSignedOut();
        }
    });
}

function updateUIForUser(user) {
    // Hide login forms
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const userProfile = document.getElementById('userProfile');
    const loginTabs = document.querySelector('.login-tabs');
    
    if (signInForm) signInForm.style.display = 'none';
    if (signUpForm) signUpForm.style.display = 'none';
    if (loginTabs) loginTabs.style.display = 'none';
    if (userProfile) userProfile.style.display = 'block';
    
    // Update profile info
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userInitial = document.getElementById('userInitial');
    
    if (userName) userName.textContent = user.displayName || 'User';
    if (userEmail) userEmail.textContent = user.email;
    if (userInitial) {
        const name = user.displayName || user.email;
        userInitial.textContent = name.charAt(0).toUpperCase();
    }
    
    // Update header login button
    updateHeaderLoginButton(user);
}

function updateUIForSignedOut() {
    const signInForm = document.getElementById('signInForm');
    const userProfile = document.getElementById('userProfile');
    const loginTabs = document.querySelector('.login-tabs');
    
    if (signInForm) signInForm.style.display = 'block';
    if (userProfile) userProfile.style.display = 'none';
    if (loginTabs) loginTabs.style.display = 'flex';
    
    // Update header login button
    updateHeaderLoginButton(null);
}

function updateHeaderLoginButton(user) {
    // This will show user initial or login icon in header
    const loginBtns = document.querySelectorAll('.icon-btn[onclick="openLogin()"]');
    loginBtns.forEach(btn => {
        if (user) {
            const initial = (user.displayName || user.email).charAt(0).toUpperCase();
            btn.innerHTML = `<div class="user-avatar-small">${initial}</div>`;
            btn.title = user.displayName || user.email;
        } else {
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            `;
            btn.title = 'Login';
        }
    });
}

function showAuthMessage(message, type) {
    const messageDiv = document.getElementById('authMessage');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `auth-message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/operation-not-allowed': 'Operation not allowed',
        'auth/weak-password': 'Password is too weak',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/too-many-requests': 'Too many failed attempts. Try again later',
        'auth/network-request-failed': 'Network error. Check your connection'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

function viewDonationHistory() {
    alert('Donation history feature coming soon!');
    // TODO: Implement donation history
}

function editProfile() {
    alert('Edit profile feature coming soon!');
    // TODO: Implement profile editing
}
