// Firebase Configuration - Fetched from backend
let firebaseAuth = null;

async function initializeFirebase() {
    try {
        // Fetch config from backend
        const response = await fetch('get-firebase-config.php');
        const config = await response.json();
        
        // Initialize Firebase
        firebase.initializeApp(config);
        firebaseAuth = firebase.auth();
        
        // Make available globally
        window.firebaseAuth = firebaseAuth;
        
        console.log('Firebase initialized successfully');
        return firebaseAuth;
        
    } catch (error) {
        console.error('Firebase initialization error:', error);
        throw error;
    }
}

// Auto-initialize on load
if (typeof firebase !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeFirebase);
}
