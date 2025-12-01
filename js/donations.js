(function () {
  function openDonateModal(type) {
    const modal = document.getElementById('donateModal');
    if (modal) modal.classList.add('active'); // Changed from 'open' to 'active'
    if (type) {
      const sel = document.getElementById('donationType');
      if (sel) sel.value = type;
    }
    
    // Hide/show Google button based on auth state
    updateGoogleButtonVisibility();
  }
  
  function closeDonateModal() {
    const modal = document.getElementById('donateModal');
    if (modal) modal.classList.remove('active'); // Changed from 'open' to 'active'
  }
  function viewProjects() {
    const el = document.getElementById('projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
  function donateToCampaign() {
    openDonateModal();
  }
  function openMonthlyDonation() {
    openDonateModal('monthly');
  }

  function initializePresetButtons() {
    const presetButtons = document.querySelectorAll('.preset-buttons button');
    const amountInput = document.querySelector('.quick-donate-container input[type="number"]');

    presetButtons.forEach(button => {
      button.addEventListener('click', function () {
        presetButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const amount = this.getAttribute('data-amount');
        if (amountInput) amountInput.value = amount;
      });
    });

    if (amountInput) {
      amountInput.addEventListener('input', function () {
        const inputValue = this.value;
        presetButtons.forEach(btn => {
          const btnAmount = btn.getAttribute('data-amount');
          if (btnAmount === inputValue) btn.classList.add('active');
          else btn.classList.remove('active');
        });
      });
    }
  }

  function checkCanceledPayment() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('canceled') === 'true') {
      showCancelNotification();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

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
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  async function handleQuickDonate(event) {
    event.preventDefault();
    const form = event.target;
    const currency = form.querySelector('#currencySelect').value;
    const amountInput = form.querySelector('input[type="number"]').value;
    const purposeSelect = form.querySelector('select[aria-label="Donation Purpose"]');
    const purpose = purposeSelect ? purposeSelect.value : 'General Fund';

    let amount = parseFloat(amountInput);
    if (!amount || isNaN(amount)) {
      const activeBtn = form.querySelector('.preset-buttons button.active');
      if (activeBtn) amount = parseFloat(activeBtn.getAttribute('data-amount'));
    }
    if (!amount || amount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    await window.createCheckoutSession({
      amount: amount,
      currency: currency,
      donationType: purpose.toLowerCase().replace(/\s+/g, '-'),
      donorName: '',
      donorEmail: ''
    });
  }

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

    await window.createCheckoutSession({
      amount: parseFloat(amount),
      currency: currency,
      donationType: donationType,
      donorName: donorName,
      donorEmail: donorEmail
    });
  }

  function updateGoogleButtonVisibility() {
    const googleBtn = document.querySelector('#donateModal .google-auth-btn');
    const signinNote = document.querySelector('#donateModal .signin-note');
    
    // Check if user is logged in (from Firebase auth or other auth system)
    if (window.firebaseAuth && window.firebaseAuth.currentUser) {
      // User is logged in - hide Google button
      if (googleBtn) googleBtn.style.display = 'none';
      if (signinNote) signinNote.style.display = 'none';
      
      // Optionally pre-fill donor info
      const currentUser = window.firebaseAuth.currentUser;
      const donorName = document.getElementById('donorName');
      const donorEmail = document.getElementById('donorEmail');
      
      if (donorName && currentUser.displayName) {
        donorName.value = currentUser.displayName;
      }
      if (donorEmail && currentUser.email) {
        donorEmail.value = currentUser.email;
      }
    } else {
      // User is not logged in - show Google button
      if (googleBtn) googleBtn.style.display = 'flex';
      if (signinNote) signinNote.style.display = 'block';
      donorName.value = "";
      donorEmail.value = "";
    }
  }

  // Inject CSS for cancellation notification
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
    .cancel-notification { position: fixed; top: -100px; left: 50%; transform: translateX(-50%); background: white; border-left: 4px solid #0b6d47; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border-radius: 8px; z-index: 10000; transition: top 0.3s ease; max-width: 500px; width: 90%; }
    .cancel-notification.show { top: 20px; }
    .cancel-notification-content { display: flex; align-items: flex-start; gap: 15px; padding: 20px; }
    .cancel-icon { font-size: 24px; flex-shrink: 0; }
    .cancel-text { flex: 1; }
    .cancel-text strong { display: block; color: #333; font-size: 16px; margin-bottom: 5px; }
    .cancel-text p { color: #666; font-size: 14px; margin: 0; }
    .cancel-close { background: none; border: none; font-size: 28px; color: #999; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s; flex-shrink: 0; }
    .cancel-close:hover { background: #f5f5f5; color: #333; }
  `;
  document.head.appendChild(style);

  // Close modal on Escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDonateModal(); });
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target && event.target.classList && event.target.classList.contains('modal-overlay')) {
      closeDonateModal();
    }
  });

  // Expose
  window.openDonateModal = openDonateModal;
  window.closeDonateModal = closeDonateModal;
  window.viewProjects = viewProjects;
  window.donateToCampaign = donateToCampaign;
  window.openMonthlyDonation = openMonthlyDonation;
  window.initializePresetButtons = initializePresetButtons;
  window.checkCanceledPayment = checkCanceledPayment;
  window.showCancelNotification = showCancelNotification;
  window.handleQuickDonate = handleQuickDonate;
  window.processDonation = processDonation;
  window.updateGoogleButtonVisibility = updateGoogleButtonVisibility;
})();
