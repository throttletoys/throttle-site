/*
 * Shared scaffolding for /account/* pages:
 *   - Hard auth gate: redirect to /signin?next=… if /api/auth/me returns null.
 *   - Renders the standard sidebar (My listings / Inbox / My reviews / Settings).
 *   - Exposes window.acctShell with { user, apiBase, $, escapeHtml, fmtDate, fmtMoney }.
 *
 * Usage on every /account/* page:
 *   <script src="/assets/account-shell.js" data-active="messages"></script>
 *   ...then your page's main script reads window.acctShell once it fires
 *   the 'acct-ready' event.
 */
(function(){
  const API_BASE = (window.THROTTLE_API_BASE || 'https://api.throttle.toys').replace(/\/$/, '');
  const $ = (s, r=document) => r.querySelector(s);
  const escapeHtml = s => String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtMoney = n => '$' + Math.round(n||0).toLocaleString();
  const fmtDate  = ts => {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    const now = Date.now();
    const ageS = (now - d.getTime()) / 1000;
    if (ageS < 60)        return 'just now';
    if (ageS < 3600)      return Math.floor(ageS/60) + 'm ago';
    if (ageS < 86400)     return Math.floor(ageS/3600) + 'h ago';
    if (ageS < 86400*7)   return Math.floor(ageS/86400) + 'd ago';
    return d.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
  };

  const SECTIONS = [
    { key: 'home',     label: 'Account home', href: '/account' },
    { key: 'listings', label: 'My listings',  href: '/account/listings' },
    { key: 'messages', label: 'Inbox',        href: '/account/messages' },
    { key: 'reviews',  label: 'My reviews',   href: '/account/reviews' },
    { key: 'settings', label: 'Settings',     href: '/account/settings' },
  ];

  function renderSidebar(activeKey, user){
    const initial = (user.display_name || user.email || '?').trim()[0].toUpperCase();
    const root = document.getElementById('acctSide');
    if (!root) return;
    root.innerHTML = `
      <div class="who">SIGNED IN AS<b>${escapeHtml(user.display_name || user.email)}</b></div>
      ${SECTIONS.map(s =>
        `<a href="${s.href}" class="${s.key===activeKey?'active':''}">${escapeHtml(s.label)}</a>`
      ).join('')}
      <a href="#" id="acctLogoutLink" style="margin-top:8px;color:var(--bad)">Sign out</a>
    `;
    const out = document.getElementById('acctLogoutLink');
    if (out) out.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await fetch(API_BASE + '/api/auth/logout', { method:'POST', credentials:'include' }); } catch {}
      location.href = '/';
    });
  }

  async function init(){
    const me = await fetch(API_BASE + '/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null).catch(() => null);
    const user = me && me.user;
    if (!user) {
      const next = encodeURIComponent(location.pathname + location.search);
      location.href = '/signin?next=' + next;
      return;
    }
    const me_script = document.currentScript || document.querySelector('script[data-active]');
    const active = (me_script && me_script.dataset && me_script.dataset.active) || 'home';
    window.acctShell = { user, apiBase: API_BASE, $, escapeHtml, fmtDate, fmtMoney };
    renderSidebar(active, user);
    document.dispatchEvent(new CustomEvent('acct-ready', { detail: { user } }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
