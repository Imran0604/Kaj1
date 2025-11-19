(function () {
  function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

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

  function showNotification(message, type = 'info') {
    try {
      const el = document.createElement('div');
      el.className = `hf-toast ${type}`;
      el.textContent = message;
      const style = document.createElement('style');
      style.textContent = `
        .hf-toast{position:fixed;right:20px;top:20px;background:#fff;color:#333;border-left:4px solid #1a5245;
          box-shadow:0 6px 20px rgba(0,0,0,.15);padding:12px 14px;border-radius:8px;z-index:10050;
          font:600 14px/1.3 system-ui, -apple-system, Segoe UI, Roboto, 'Outfit', sans-serif;opacity:0;transform:translateY(-10px);
          transition:opacity .2s ease, transform .2s ease}
        .hf-toast.success{border-color:#0b6d47}
        .hf-toast.error{border-color:#c0392b}
      `;
      document.head.appendChild(style);
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-10px)';
        setTimeout(() => el.remove(), 200);
      }, 3000);
    } catch {
      console.log(`[${type}] ${message}`);
    }
  }

  window.parseJwt = parseJwt;
  window.debounce = debounce;
  window.showNotification = showNotification;
})();
