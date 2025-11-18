# Firebase Authentication Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: "humanity-first-foundation"
4. Follow the setup wizard

## 2. Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click "Get Started"
3. Enable sign-in methods:
   - Email/Password ✓
   - Google ✓

## 3. Register Your Web App

1. In Project Overview, click the web icon (</>)
2. Register app with nickname: "HFF Web App"
3. Copy the firebaseConfig object

## 4. Update firebase-config.js

Replace the configuration in `firebase-config.js` with your values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};
```

## 5. Configure Authorized Domains

1. Go to **Authentication → Settings → Authorized domains**
2. Add your domain (e.g., `localhost`, `yoursite.com`)

## 6. Test the Integration

1. Open your website
2. Click the login icon
3. Try signing up with email
4. Try Google sign-in

## Features Included

✅ Email/Password authentication
✅ Google Sign-In
✅ Password reset
✅ Remember me
✅ User profile display
✅ Persistent sessions
✅ Error handling

Done! Your Firebase authentication is now ready.
