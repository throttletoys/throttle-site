/*
 * Shared auth-state widget for the top nav.
 *
 * Drop-in: include <script defer src="/assets/auth-nav.js"></script> at the
 * bottom of any page's <body>.
 *
 * Behaviour: calls /api/auth/me. If logged in, replaces the rightmost
 * "Browse →" / "Sign in" CTA with an account dropdown (display name or email
 * prefix, plus a menu of My Listings / Inbox / Settings / Sign out). If
 * logged out, ensures a "Sign in" link is visible in the nav.
 *
 * No external deps. Cookie-only auth — never reads tokens from JS.
 */
(function(){
  const API_BASE = (window.THROTTLE_API_BASE || 'https://api.throttle.toys').replace(/\/$/, '');
  const $ = (s, r=document) => r.querySelector(s);
  const escapeHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function ensureStyles(){
    if (document.getElementById('auth-nav-styles')) return;
    const css = document.createElement('style');
    css.id = 'auth-nav-styles';
    css.textContent = `
      .auth-cta{display:inline-flex;gap:8px;align-items:center}
      .acct-btn{display:inline-flex;align-items:center;gap:8px;background:transparent;border:1px solid var(--line-2);border-radius:10px;padding:8px 12px 8px 8px;color:var(--txt);font:inherit;font-weight:600;font-size:14px;cursor:pointer}
      .acct-btn:hover{background:var(--bg-3)}
      .acct-avatar{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,var(--acc),var(--acc-2));color:var(--acc-ink);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;letter-spacing:-.01em}
      .acct-menu{position:absolute;top:calc(100% + 4px);right:0;background:var(--bg-1);border:1px solid var(--line);border-radius:12px;box-shadow:0 12px 36px rgba(0,0,0,.45);padding:6px;min-width:220px;display:none;z-index:50}
      .acct-wrap.open .acct-menu{display:block}
      .acct-menu a, .acct-menu button{display:block;width:100%;text-align:left;padding:9px 12px;color:var(--txt);background:transparent;border:0;border-radius:7px;font:inherit;font-size:14px;cursor:pointer}
      .acct-menu a:hover, .acct-menu button:hover{background:var(--bg-3);color:var(--acc)}
      .acct-menu .sep{height:1px;background:var(--line);margin:4px 0}
      .acct-menu .who{padding:9px 12px;color:var(--txt-3);font-size:12px;letter-spacing:.04em}
      .acct-wrap{position:relative}
      .verify-banner{background:color-mix(in srgb,var(--gold) 14%,var(--bg-1));border-bottom:1px solid color-mix(in srgb,var(--gold) 35%,transparent);color:var(--gold);font-size:13px;padding:8px 22px;text-align:center}
      .verify-banner a{color:var(--gold);text-decoration:underline;font-weight:700}
    `;
    document.head.appendChild(css);
  }

  function buildLoggedInWidget(user){
    const initial = (user.display_name || user.email || '?').trim()[0].toUpperCase();
    const display = escapeHtml(user.display_name || user.email.split('@')[0]);
    const isDealer = user.role === 'dealer';
    return `
      <div class="acct-wrap">
        <button class="acct-btn" type="button" aria-haspopup="true" aria-expanded="false">
          <span class="acct-avatar">${escapeHtml(initial)}</span>
          ${display}
          <span style="opacity:.55;font-size:11px">▾</span>
        </button>
        <div class="acct-menu" role="menu">
          <div class="who">Signed in as<br><b style="color:var(--txt)">${escapeHtml(user.email)}</b></div>
          <div class="sep"></div>
          <a href="/account/listings" role="menuitem">My listings</a>
          <a href="/account/messages" role="menuitem">Inbox</a>
          <a href="/account/reviews" role="menuitem">My reviews</a>
          ${isDealer ? '<a href="/account/dealer" role="menuitem">Dealer dashboard</a>' : ''}
          <div class="sep"></div>
          <a href="/account/settings" role="menuitem">Account settings</a>
          <button data-action="logout" role="menuitem">Sign out</button>
        </div>
      </div>`;
  }

  function buildLoggedOutWidget(){
    return `
      <span class="auth-cta">
        <a class="btn ghost" href="/signin">Sign in</a>
        <a class="btn" href="/signup">Sign up</a>
      </span>`;
  }

  function attachLogoutHandler(root){
    root.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action="logout"]');
      if (!btn) return;
      try {
        await fetch(API_BASE + '/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch {}
      location.href = '/';
    });
  }

  function attachDropdownToggle(root){
    const wrap = root.querySelector('.acct-wrap');
    const btn = root.querySelector('.acct-btn');
    if (!wrap || !btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', wrap.classList.contains('open') ? 'true' : 'false');
    });
    document.addEventListener('click', () => wrap.classList.remove('open'));
  }

  async function loadUser(){
    try {
      const r = await fetch(API_BASE + '/api/auth/me', { credentials: 'include' });
      if (!r.ok) return null;
      const j = await r.json();
      return j && j.user || null;
    } catch { return null; }
  }

  function findCtaContainer(){
    // The standard nav has these two trailing CTAs: <a class="btn ghost"> + <a class="btn">.
    // We rip both out and replace with our widget. Look for them inside <header.top>.
    const header = document.querySelector('header.top');
    if (!header) return null;
    // Anything that's NOT inside <nav class="main"> AND has the .btn class
    const ctas = [...header.querySelectorAll(':scope > .btn, :scope > a.btn, :scope > a.btn.ghost, :scope > .auth-cta, :scope > .acct-wrap')];
    return { header, ctas };
  }

  function renderVerifyBanner(){
    if (document.querySelector('.verify-banner')) return;
    const div = document.createElement('div');
    div.className = 'verify-banner';
    div.innerHTML = `Please verify your email to start sending messages and posting reviews. <a href="/account/settings#verify">Resend verification</a>`;
    const header = document.querySelector('header.top');
    if (header && header.parentNode) header.parentNode.insertBefore(div, header.nextSibling);
  }

  async function init(){
    ensureStyles();
    const ctx = findCtaContainer();
    if (!ctx) return;
    const { header, ctas } = ctx;

    const user = await loadUser();

    // Wipe out existing CTA buttons so we can replace cleanly
    ctas.forEach(el => el.remove());

    const span = document.createElement('span');
    span.className = 'auth-widget';
    span.style.marginLeft = 'auto';
    span.innerHTML = user ? buildLoggedInWidget(user) : buildLoggedOutWidget();
    header.appendChild(span);

    if (user) {
      attachDropdownToggle(span);
      attachLogoutHandler(span);
      if (!user.email_verified) renderVerifyBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
