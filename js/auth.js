(function () {
  let loginModal = null;
  let currentUser = null;

  function openLogin() {
    if (!loginModal) createLoginModal();
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
        <div class="modal-header"><h2>👤 Sign In</h2><p>Access your account to track donations and save preferences</p></div>
        <div class="modal-body">
          <div class="login-tabs">
            <button class="login-tab active" onclick="switchLoginTab('signin')">Sign In</button>
            <button class="login-tab" onclick="switchLoginTab('signup')">Sign Up</button>
          </div>
          <form id="signInForm" class="login-form" style="display: block;">
            <div class="form-group"><label>Email</label><input type="email" id="signInEmail" class="form-control" placeholder="your@email.com" required></div>
            <div class="form-group"><label>Password</label><input type="password" id="signInPassword" class="form-control" placeholder="••••••••" required></div>
            <div class="form-actions">
              <label class="remember-me"><input type="checkbox" id="rememberMe"><span>Remember me</span></label>
              <a href="#" class="forgot-password" onclick="handleForgotPassword(); return false;">Forgot password?</a>
            </div>
            <button type="submit" class="auth-btn" onclick="handleSignIn(event)">Sign In</button>
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
          <form id="signUpForm" class="login-form" style="display: none;">
            <div class="form-group"><label>Full Name</label><input type="text" id="signUpName" class="form-control" placeholder="John Doe" required></div>
            <div class="form-group"><label>Email</label><input type="email" id="signUpEmail" class="form-control" placeholder="your@email.com" required></div>
            <div class="form-group"><label>Password</label><input type="password" id="signUpPassword" class="form-control" placeholder="Min. 6 characters" required></div>
            <div class="form-group"><label>Confirm Password</label><input type="password" id="signUpPasswordConfirm" class="form-control" placeholder="Confirm password" required></div>
            <button type="submit" class="auth-btn" onclick="handleSignUp(event)">Create Account</button>
            <div class="divider"><span>OR</span></div>
            <button type="button" class="google-auth-btn" onclick="handleGoogleSignIn()">
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign up with Google
            </button>
          </form>
          <div id="userProfile" class="user-profile" style="display: none;">
            <div class="profile-header">
              <div class="profile-avatar" id="userAvatar"><span id="userInitial">U</span></div>
              <div class="profile-info"><h3 id="userName">User Name</h3><p id="userEmail">user@email.com</p></div>
            </div>
            <div class="profile-actions">
              <button class="profile-btn" onclick="viewDonationHistory()">📜 Donation History</button>
              <button class="profile-btn" onclick="editProfile()">✏️ Edit Profile</button>
              <button class="profile-btn logout-btn" onclick="handleSignOut()">🚪 Sign Out</button>
            </div>
          </div>
          <div id="authMessage" class="auth-message"></div>
        </div>
      </div>
    `;
    document.body.appendChild(loginModal);
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
      const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
      await firebaseAuth.setPersistence(persistence);
      const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
      showAuthMessage('Successfully signed in!', 'success');
      updateUIForUser(userCredential.user);
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

    if (password !== confirmPassword) { showAuthMessage('Passwords do not match', 'error'); return; }
    if (password.length < 6) { showAuthMessage('Password must be at least 6 characters', 'error'); return; }

    try {
      showAuthMessage('Creating account...', 'info');
      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName: name });
      showAuthMessage('Account created successfully!', 'success');
      updateUIForUser(userCredential.user);
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
      updateUIForUser(result.user);
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
    if (!email) { showAuthMessage('Please enter your email address first', 'error'); return; }
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
      updateUIForSignedOut();
      setTimeout(() => closeLogin(), 1000);
    } catch (error) {
      console.error('Sign out error:', error);
      showAuthMessage('Error signing out', 'error');
    }
  }

  function initializeAuthListener() {
    firebaseAuth.onAuthStateChanged(user=>{
      currentUser=user;
      if (user) updateUIForUser(user); else updateUIForSignedOut();
      
      // Update donation modal if it's open
      if (window.updateGoogleButtonVisibility) {
        window.updateGoogleButtonVisibility();
      }
    });
  }

  function updateUIForUser(user) {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const userProfile = document.getElementById('userProfile');
    const loginTabs = document.querySelector('.login-tabs');

    if (signInForm) signInForm.style.display = 'none';
    if (signUpForm) signUpForm.style.display = 'none';
    if (loginTabs) loginTabs.style.display = 'none';
    if (userProfile) userProfile.style.display = 'block';

    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userInitial = document.getElementById('userInitial');

    if (userName) userName.textContent = user.displayName || 'User';
    if (userEmail) userEmail.textContent = user.email;
    if (userInitial) {
      const name = user.displayName || user.email;
      userInitial.textContent = name.charAt(0).toUpperCase();
    }
    updateHeaderLoginButton(user);
  }

  function updateUIForSignedOut() {
    const signInForm = document.getElementById('signInForm');
    const userProfile = document.getElementById('userProfile');
    const loginTabs = document.querySelector('.login-tabs');

    if (signInForm) signInForm.style.display = 'block';
    if (userProfile) userProfile.style.display = 'none';
    if (loginTabs) loginTabs.style.display = 'flex';

    updateHeaderLoginButton(null);
  }

  function updateHeaderLoginButton(user) {
    const loginBtns = document.querySelectorAll('.icon-btn[onclick="openLogin()"]');
    loginBtns.forEach(btn => {
      if (user) {
        const initial = (user.displayName || user.email).charAt(0).toUpperCase();
        btn.innerHTML = `<div class="user-avatar-small">${initial}</div>`;
        btn.title = user.displayName || user.email;
      } else {
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>`;
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
      setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
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

  function viewDonationHistory() { alert('Donation history feature coming soon!'); }
  function editProfile() { alert('Edit profile feature coming soon!'); }

  window.openLogin = openLogin;
  window.closeLogin = closeLogin;
  window.switchLoginTab = switchLoginTab;
  window.handleSignIn = handleSignIn;
  window.handleSignUp = handleSignUp;
  window.handleGoogleSignIn = handleGoogleSignIn;
  window.handleForgotPassword = handleForgotPassword;
  window.handleSignOut = handleSignOut;
  window.viewDonationHistory = viewDonationHistory;
  window.editProfile = editProfile;
})();
