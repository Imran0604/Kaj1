(function initMegaMenu() {
  const nav = document.querySelector('.navbar.mega-enabled');
  if (!nav) return;
  const panels = nav.querySelectorAll('.mega-panel');
  const toggles = nav.querySelectorAll('.nav-toggle');

  function closeAll(exceptId) {
    panels.forEach(p => {
      if (p.id !== exceptId) {
        p.classList.remove('open');
        p.setAttribute('aria-hidden', 'true');
      }
    });
    toggles.forEach(t => {
      if (t.getAttribute('aria-controls') !== exceptId) {
        t.setAttribute('aria-expanded', 'false');
      }
    });
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('aria-controls');
      const panel = document.getElementById(id);
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      closeAll(expanded ? null : id);
      if (!expanded) {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
      } else {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) closeAll(null); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(null); });

  const mobileBtn = document.querySelector('.mobile-menu-btn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      nav.classList.toggle('mobile-open');
      closeAll(null);
    });
  }

  const megaStyle = document.createElement('style');
  megaStyle.textContent = `
    .navbar.mega-enabled { position: relative; }
    .primary-nav { list-style: none; display: flex; gap: 1.2rem; margin: 0; padding: 0; }
    .primary-nav > .nav-item { position: relative; }
    .nav-toggle { background: none; border: none; font: inherit; cursor: pointer; display: flex; align-items: center; gap: .35rem; padding: .4rem .6rem; border-radius: 4px; }
    .nav-toggle[aria-expanded="true"] { background: rgba(26,82,69,0.12); }
    .mega-panels { position: static; }
    .mega-panel { position: absolute; left: 0; width: 100%; top: 100%; background: #fff; border-top: 2px solid #1a5245; box-shadow: 0 18px 40px -8px rgba(0,0,0,.15); opacity:0; pointer-events:none; transform: translateY(10px); transition: opacity .18s ease, transform .18s ease; padding: 32px 60px; display: grid; gap: 28px; grid-template-columns: minmax(240px,300px) 1fr; z-index: 900; }
    .mega-panel.open { opacity:1; pointer-events:auto; transform: translateY(0); }
    .mega-header h4 { margin:0 0 6px; color:#1a5245; font-size:1.15rem; }
    .mega-header p { margin:0 0 14px; font-size:.85rem; color:#444; line-height:1.3; }
    .mega-header .mega-cta { display:inline-block; font-size:.75rem; text-transform:uppercase; letter-spacing:.05em; font-weight:600; color:#0b6d47; text-decoration:none; border-bottom:1px solid transparent; }
    .mega-header .mega-cta:hover { border-color:#0b6d47; }
    .mega-grid { display:grid; gap:34px; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); }
    .mega-grid h5 { margin:0 0 8px; font-size:.75rem; text-transform:uppercase; letter-spacing:.08em; color:#0b6d47; }
    .mega-grid a { display:block; font-size:.85rem; padding:4px 0; text-decoration:none; color:#222; border-radius:3px; }
    .mega-grid a:hover { color:#0b6d47; background:rgba(11,109,71,0.06); }
    .nav-item > a { text-decoration:none; padding:.45rem .6rem; display:block; }
    .donate-inline .donate-btn-nav { padding:.45rem .9rem; }
    @media (max-width: 920px) {
      .primary-nav { flex-wrap:wrap; }
      .mega-panel { position: static; opacity:1 !important; transform:none !important; pointer-events:auto; box-shadow:none; border:1px solid #e3e3e3; margin:8px 0 16px; padding:20px 24px; display:none; }
      .mega-panel.open { display:grid; }
      .navbar.mega-enabled.mobile-open .primary-nav { display:flex; }
    }
  `;
  document.head.appendChild(megaStyle);
})();
