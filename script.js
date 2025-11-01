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

// Toggle Mobile Menu
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Open Donation Modal (no amount reset)
function openDonateModal(type = 'general') {
	const modal = document.getElementById('donateModal');
	modal.style.display = 'block';
	document.getElementById('donationType').value = type;
	document.body.style.overflow = 'hidden';
}

// Close Donation Modal
function closeDonateModal() {
    const modal = document.getElementById('donateModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Select Amount
let selectedAmount = null;
function selectAmount(amount, event) {
    if (event) {
        event.preventDefault();
    }
    selectedAmount = amount;
    document.getElementById('customAmount').value = '';
    
    // Update button styles
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Select Monthly Package
function selectMonthlyPackage(amount) {
    openDonateModal('monthly');
    setTimeout(() => {
        const btns = document.querySelectorAll('.amount-btn');
        btns.forEach(btn => {
            if (btn.textContent.includes(`$${amount}`)) {
                selectedAmount = amount;
                btn.classList.add('active');
            }
        });
    }, 300);
}

// Open Monthly Donation
function openMonthlyDonation() {
    openDonateModal('monthly');
}

// Donate to Campaign
function donateToCampaign(campaignId) {
    openDonateModal('general');
    sessionStorage.setItem('campaignId', campaignId);
}

// View Projects
function viewProjects(category) {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Build Stripe URL with optional prefilled email and reference
function buildStripeUrl({ email, type, campaign }) {
	const base = STRIPE_CHECKOUT_URL; // use the fixed alias
	const url = new URL(base);
	if (email) url.searchParams.set('prefilled_email', email);
	url.searchParams.set('client_reference_id', [`type:${type}`, `camp:${campaign}`].join('|'));
	return url.toString();
}

// Process Donation - redirect without amount (open only in new tab)
function processDonation() {
	const donationType = document.getElementById('donationType').value;
	const donorName = document.getElementById('donorName').value;
	const donorEmail = document.getElementById('donorEmail').value;
	const campaign = sessionStorage.getItem('campaignId') || 'general';

	// Optional local tracking (no amount)
	const donations = JSON.parse(localStorage.getItem('donationAttempts') || '[]');
	donations.push({
		type: donationType,
		name: donorName || 'Anonymous',
		email: donorEmail || '',
		campaign,
		timestamp: new Date().toISOString()
	});
	localStorage.setItem('donationAttempts', JSON.stringify(donations));

	const stripeUrl = buildStripeUrl({
		email: donorEmail || (googleUser?.email || ''),
		type: donationType,
		campaign
	});

	// Guard against double-trigger
	if (isNavigatingToStripe) return;
	isNavigatingToStripe = true;

	// Disable button to prevent double clicks
	const btn = document.querySelector('#donationForm .submit-btn');
	if (btn) {
		btn.disabled = true;
		btn.style.opacity = '0.7';
		btn.innerHTML = '<span>Redirecting to Stripe…</span>';
	}

	// Try to open in new tab/window
	const newTab = window.open(stripeUrl, '_blank', 'noopener,noreferrer');

	if (newTab) {
		// Navigation succeeded in new tab
		closeDonateModal();
		return;
	}

	// Popup blocked: restore state and show a clickable fallback link
	isNavigatingToStripe = false;
	if (btn) {
		btn.disabled = false;
		btn.style.opacity = '1';
		btn.innerHTML = '<span>Continue to Stripe Checkout</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
	}

	// Build actionable notification with a manual link
	const note = document.createElement('div');
	note.style.cssText = `
		position: fixed; top: 100px; right: 20px; z-index: 10000;
		background: #f39c12; color: #1b1b1b; padding: 1rem 1.25rem;
		border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
		display: flex; gap: .6rem; align-items: center; max-width: 340px;
	`;
	note.innerHTML = `
		<span>Popup blocked. </span>
		<a href="${stripeUrl}" target="_blank" rel="noopener noreferrer" style="color:#0b62ff; font-weight:600; text-decoration:underline">
			Open Stripe Checkout
		</a>
	`;
	document.body.appendChild(note);
	setTimeout(() => note.remove(), 6000);
}

// Show Notification
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Humani First Foundation - Ready');
});
