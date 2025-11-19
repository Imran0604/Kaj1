(function () {
  let googleUser = null;

  function initializeGoogleSignIn() {
    if (typeof google !== 'undefined' && document.getElementById('googleSignInDiv')) {
      try {
        google.accounts.id.initialize({
          client_id: 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com',
          callback: handleGoogleSignIn
        });
        google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { theme: 'outline', size: 'large', text: 'signin_with', width: 250 }
        );
      } catch (error) {
        console.log('Google Sign-In not configured');
      }
    }
  }

  function handleGoogleSignIn(response) {
    const userData = window.parseJwt ? window.parseJwt(response.credential) : {};
    googleUser = { name: userData.name, email: userData.email, picture: userData.picture };

    const nameEl = document.getElementById('donorName');
    const emailEl = document.getElementById('donorEmail');
    if (nameEl) nameEl.value = googleUser.name || '';
    if (emailEl) emailEl.value = googleUser.email || '';

    if (window.showNotification) window.showNotification(`Welcome ${googleUser.name || 'back'}!`, 'success');
  }

  window.initializeGoogleSignIn = initializeGoogleSignIn;
  window.handleGoogleSignIn = handleGoogleSignIn;
})();
