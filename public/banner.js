/**
 * SubcontractorHub — CRO Banner Suite
 * Drop this script in GTM or paste into <head> on subcontractorhub.com
 * Hosted: https://cro-sub-hub.vercel.app/banner.js
 *
 * Popups: welcome modal (4s) · scroll-depth (40%) · exit-intent · sticky footer
 * All CTAs route to https://app.subcontractorhub.com/sch-book-a-demo with UTM
 */
(function () {
  'use strict';

  // Pre-hide the blog form immediately (sync) so it never flashes before the banner loads
  if (/\/blog\b/i.test(window.location.pathname)) {
    var _ph = document.createElement('style');
    _ph.textContent = 'form.formBlogDetail{visibility:hidden!important}';
    (document.head || document.documentElement).appendChild(_ph);
  }

  var DEMO_URL = 'https://app.subcontractorhub.com/sch-book-a-demo';
  var UTM_BASE = '?utm_source=site&utm_medium=popup&utm_campaign=lead-capture';

  // Pages where we should NOT show popups (support/legal/auth flows confuse the funnel)
  var EXCLUDED_PATHS = ['/support', '/privacy', '/terms', '/plan', '/login', '/help', '/careers'];

  function isExcludedPage() {
    var path = window.location.pathname;
    return EXCLUDED_PATHS.some(function (p) { return path.startsWith(p); });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function demoLink(content) {
    return DEMO_URL + UTM_BASE + '&utm_content=' + content;
  }

  // 24-hour first-party cookie guard.
  // Replaces sessionStorage so repeat visitors don't see the popup on every new
  // tab/window within the same day (sessionStorage resets per browsing context).
  function setCookie(name, hours) {
    var d = new Date();
    d.setTime(d.getTime() + hours * 3600000);
    document.cookie = name + '=1;expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    var match = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
    return match ? match[1] : null;
  }

  function injectStyles() {
    var css = [
      '@keyframes schFadeIn{from{opacity:0}to{opacity:1}}',
      '@keyframes schSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}',
      '@keyframes schSlideFooter{from{transform:translateY(100%)}to{transform:translateY(0)}}',
      '#sch-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);animation:schFadeIn .2s ease}',
      '#sch-modal{background:#fff;color:#111;border-radius:18px;padding:40px 36px 32px;max-width:440px;width:100%;position:relative;box-shadow:0 28px 80px rgba(0,0,0,.45);animation:schSlideUp .25s ease;text-align:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
      '#sch-modal h2{font-size:1.5rem;font-weight:800;line-height:1.25;margin:0 0 12px;color:#111}',
      '#sch-modal p{font-size:.95rem;color:#555;line-height:1.6;margin:0 0 24px}',
      '.sch-pill{display:inline-block;margin-bottom:20px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#6366f1;background:rgba(99,102,241,.1);padding:3px 12px;border-radius:4px}',
      '.sch-cta-btn{display:block;padding:15px 24px;border-radius:10px;background:#6366f1;color:#fff !important;font-weight:700;font-size:1.05rem;text-decoration:none;margin-bottom:12px;box-shadow:0 4px 18px rgba(99,102,241,.4);transition:background .15s}',
      '.sch-cta-btn:hover{background:#4f46e5}',
      '.sch-micro{font-size:.8rem;color:#bbb;margin:0 0 16px}',
      '.sch-no-thanks{background:none;border:none;color:#ccc;font-size:.82rem;cursor:pointer;text-decoration:underline;padding:0}',
      '.sch-close{position:absolute;top:14px;right:18px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#bbb;line-height:1;padding:2px 6px}',
      // Exit-intent styles
      '#sch-exit-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);animation:schFadeIn .2s ease}',
      '#sch-exit-modal{background:#fff;color:#111;border-radius:18px;padding:40px 36px 32px;max-width:460px;width:100%;position:relative;box-shadow:0 28px 80px rgba(0,0,0,.45);animation:schSlideUp .25s ease;text-align:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
      '#sch-exit-modal h2{font-size:1.4rem;font-weight:800;line-height:1.25;margin:0 0 10px;color:#111}',
      '#sch-exit-modal p{font-size:.92rem;color:#555;line-height:1.55;margin:0 0 22px}',
      '.sch-exit-pill{display:inline-block;margin-bottom:18px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#0891b2;background:rgba(8,145,178,.1);padding:3px 12px;border-radius:4px}',
      '.sch-role-btns{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}',
      '.sch-role-btn{display:block;padding:14px 24px;border-radius:10px;font-weight:700;font-size:.98rem;text-decoration:none;transition:background .15s,transform .1s}',
      '.sch-role-btn-sub{background:#0891b2;color:#fff !important;box-shadow:0 4px 14px rgba(8,145,178,.38)}',
      '.sch-role-btn-sub:hover{background:#0e7490;transform:translateY(-1px)}',
      '.sch-role-btn-gc{background:#f3f4f6;color:#374151 !important;border:1px solid #e5e7eb}',
      '.sch-role-btn-gc:hover{background:#e5e7eb;transform:translateY(-1px)}',
      '#sch-footer{position:fixed;bottom:0;left:0;right:0;z-index:2147483645;background:linear-gradient(90deg,#4f46e5 0%,#6366f1 100%);box-shadow:0 -4px 24px rgba(99,102,241,.35);display:flex;align-items:center;justify-content:center;gap:16px;padding:13px 48px 13px 24px;animation:schSlideFooter .35s cubic-bezier(.22,1,.36,1);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
      '#sch-footer .sch-f-headline{color:#fff;font-size:.95rem;font-weight:700;white-space:nowrap}',
      '#sch-footer .sch-f-sub{color:rgba(255,255,255,.75);font-size:.85rem;display:none}',
      '@media(min-width:680px){#sch-footer .sch-f-sub{display:inline}}',
      '#sch-footer .sch-f-btn{background:#fff;color:#4f46e5 !important;font-weight:700;font-size:.875rem;padding:8px 20px;border-radius:8px;text-decoration:none;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.15)}',
      '#sch-footer .sch-f-close{position:absolute;right:16px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,.6);font-size:1.3rem;cursor:pointer;line-height:1;padding:4px 6px}',
    ].join('');

    var style = document.createElement('style');
    style.id = 'sch-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── Sticky footer bar ──────────────────────────────────────────────────────
  function showFooter() {
    if (document.getElementById('sch-footer')) return;

    var bar = document.createElement('div');
    bar.id = 'sch-footer';
    bar.innerHTML = [
      '<span class="sch-f-headline">More Jobs. Less Chaos.</span>',
      '<span class="sch-f-sub">Trusted by 500+ roofing, solar &amp; HVAC teams &mdash; AI quoting, projects, payments.</span>',
      '<a href="' + demoLink('sticky-footer-bar') + '" class="sch-f-btn" target="_blank" rel="noopener">Book a Free Demo</a>',
      '<button class="sch-f-close" aria-label="Close">&#215;</button>',
    ].join('');

    document.body.appendChild(bar);

    var prev = parseInt(document.body.style.paddingBottom || 0, 10);
    document.body.style.paddingBottom = (prev + 56) + 'px';

    bar.querySelector('.sch-f-close').addEventListener('click', function () {
      bar.remove();
      setCookie('sch_footer_dismissed', 24);
      document.body.style.paddingBottom = prev + 'px';
    });
  }

  // ── Welcome popup modal (4s delay) ─────────────────────────────────────────
  function showPopup() {
    if (document.getElementById('sch-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'sch-overlay';
    overlay.innerHTML = [
      '<div id="sch-modal">',
      '  <button class="sch-close" aria-label="Close">&#215;</button>',
      '  <div class="sch-pill">Trusted by 500+ Crews</div>',
      '  <h2>More Jobs. Less Chaos.</h2>',
      '  <p>The all-in-one platform for roofing, solar, and HVAC businesses — AI quoting, project management, and faster payments from one login.</p>',
      '  <a href="' + demoLink('primary-modal-popup') + '" class="sch-cta-btn" target="_blank" rel="noopener">Book a Demo &#8594;</a>',
      '  <p class="sch-micro">Free 30-min demo &middot; No commitment &middot; Setup in a day.</p>',
      '  <button class="sch-no-thanks">No thanks</button>',
      '</div>',
    ].join('');

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    setCookie('sch_popup_seen', 24);

    function close() {
      overlay.remove();
      document.body.style.overflow = '';
    }

    overlay.querySelector('.sch-close').addEventListener('click', close);
    overlay.querySelector('.sch-no-thanks').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
  }

  // ── Scroll-depth popup (fires at 40% scroll) ───────────────────────────────
  // Suppressed if welcome modal already fired today (prevents double-popup same session).
  // Uses a different headline/angle to avoid repetition if a returning user sees it.
  function initScrollPopup() {
    var fired = false;

    function onScroll() {
      if (fired) return;
      var scrolled = window.scrollY + window.innerHeight;
      var total = document.documentElement.scrollHeight;
      if (scrolled / total < 0.40) return;

      fired = true;
      window.removeEventListener('scroll', onScroll);

      // Suppress if the welcome modal fired in this 24h window
      if (getCookie('sch_popup_seen') || getCookie('sch_scroll_seen')) return;

      var overlay = document.createElement('div');
      overlay.id = 'sch-overlay';
      overlay.innerHTML = [
        '<div id="sch-modal">',
        '  <button class="sch-close" aria-label="Close">&#215;</button>',
        '  <div class="sch-pill">See It In Action</div>',
        '  <h2>Win More Bids. Run Better Projects.</h2>',
        '  <p>SubcontractorHub automates quoting, job tracking, and payments — built for roofing, solar, and HVAC crews who want to scale without the chaos.</p>',
        '  <a href="' + demoLink('scroll-depth-popup') + '" class="sch-cta-btn" target="_blank" rel="noopener">See How It Works &#8594;</a>',
        '  <p class="sch-micro">Trusted by 500+ crews &middot; Setup in a day &middot; No commitment.</p>',
        '  <button class="sch-no-thanks">No thanks</button>',
        '</div>',
      ].join('');

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      setCookie('sch_scroll_seen', 24);

      function close() {
        overlay.remove();
        document.body.style.overflow = '';
      }

      overlay.querySelector('.sch-close').addEventListener('click', close);
      overlay.querySelector('.sch-no-thanks').addEventListener('click', close);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
      });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Exit-intent popup ──────────────────────────────────────────────────────
  // Desktop: fires when mouse exits toward browser chrome (clientY < 5px) after 15s.
  // Mobile:  fires on rapid scroll-up spike (≥100px reversal) after scrolling 40%+
  //          down and spending 15s on page — mimics the "heading back to address bar"
  //          intent signal that mouseout catches on desktop.
  function initExitIntent() {
    var pageEnter = Date.now();
    var fired = false;

    function showExitModal() {
      if (fired) return;
      if (getCookie('sch_exit_seen')) return;
      fired = true;

      // Clean up listeners
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('scroll', onMobileExit);

      var overlay = document.createElement('div');
      overlay.id = 'sch-exit-overlay';
      overlay.innerHTML = [
        '<div id="sch-exit-modal">',
        '  <button class="sch-close" aria-label="Close">&#215;</button>',
        '  <div class="sch-exit-pill">Before You Go</div>',
        '  <h2>Quick question before you leave&hellip;</h2>',
        '  <p>What best describes your business? We\'ll show you exactly what SubcontractorHub can do for you.</p>',
        '  <div class="sch-role-btns">',
        '    <a href="' + demoLink('exit-intent-sub') + '" class="sch-role-btn sch-role-btn-sub" target="_blank" rel="noopener">I run a subcontracting crew &#8594;</a>',
        '    <a href="' + demoLink('exit-intent-gc') + '" class="sch-role-btn sch-role-btn-gc" target="_blank" rel="noopener">I\'m a GC / general contractor &#8594;</a>',
        '  </div>',
        '  <button class="sch-no-thanks">Neither &mdash; just browsing</button>',
        '</div>',
      ].join('');

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      setCookie('sch_exit_seen', 24);

      function close() {
        overlay.remove();
        document.body.style.overflow = '';
      }

      overlay.querySelector('.sch-close').addEventListener('click', close);
      overlay.querySelector('.sch-no-thanks').addEventListener('click', close);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
      });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
      });
    }

    // Desktop: mouse exits toward browser chrome
    function onMouseOut(e) {
      if (e.clientY > 5) return;
      if (Date.now() - pageEnter < 15000) return;
      showExitModal();
    }

    // Mobile: rapid upward scroll after being 40%+ down the page for 15s+
    var maxScrollY = 0;
    function onMobileExit() {
      if (fired) return;
      var sy = window.scrollY;
      if (sy > maxScrollY) { maxScrollY = sy; return; }
      var docH = document.documentElement.scrollHeight;
      if (maxScrollY < docH * 0.40) return;            // must have scrolled 40%+ down
      if (sy > maxScrollY - 100) return;               // must be a 100px+ reversal
      if (Date.now() - pageEnter < 15000) return;      // must have spent 15s on page
      showExitModal();
    }

    document.addEventListener('mouseout', onMouseOut);
    window.addEventListener('scroll', onMobileExit, { passive: true });
  }

  // ── Blog contact-form → right-rail + mid-article CTA banners ────────────
  function replaceBlogContactForm() {
    if (!/\/blog\b/i.test(window.location.pathname)) return;

    var form = document.querySelector('form.formBlogDetail');
    if (!form) return;

    var formCol = form.closest('[class*="col-"]');
    var row = formCol ? formCol.closest('.row') : null;

    var starSVG = '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    var checkSVG = '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';

    // ── 1. Right-rail sticky banner (replaces form column) ───────────────────
    var railCSS = [
      '#sch-rail-banner{background:linear-gradient(160deg,#1a1f6e 0%,#2d3282 55%,#1e2875 100%);border-radius:14px;padding:28px 22px 24px;position:sticky;top:96px;text-align:center;box-shadow:0 8px 40px rgba(26,31,110,.35);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-sizing:border-box;}',
      '#sch-rail-banner .schr-stars{display:inline-flex;align-items:center;justify-content:center;gap:4px;font-size:.72rem;font-weight:700;color:#fbbf24;margin-bottom:14px;letter-spacing:.03em;background:rgba(251,191,36,.12);padding:4px 10px;border-radius:20px;}',
      '#sch-rail-banner .schr-stars svg{width:11px;height:11px;fill:#fbbf24;}',
      '#sch-rail-banner .schr-headline{color:#fff;font-size:1.1rem;font-weight:800;line-height:1.25;margin:0 0 10px;}',
      '#sch-rail-banner .schr-sub{color:rgba(255,255,255,.72);font-size:.82rem;line-height:1.5;margin:0 0 16px;}',
      '#sch-rail-banner .schr-divider{border:none;border-top:1px solid rgba(255,255,255,.12);margin:0 0 14px;}',
      '#sch-rail-banner .schr-feature{display:flex;align-items:center;gap:8px;font-size:.78rem;color:rgba(255,255,255,.78);margin-bottom:8px;text-align:left;}',
      '#sch-rail-banner .schr-feature svg{flex-shrink:0;width:13px;height:13px;fill:#34d399;}',
      '#sch-rail-banner .schr-btn{display:block;background:#f59e0b;color:#1a1f6e !important;font-weight:800;font-size:.9rem;padding:13px 20px;border-radius:9px;text-decoration:none;box-shadow:0 4px 16px rgba(245,158,11,.45);transition:background .15s,transform .1s;margin-top:20px;margin-bottom:8px;}',
      '#sch-rail-banner .schr-btn:hover{background:#d97706;transform:translateY(-1px);}',
      '#sch-rail-banner .schr-note{font-size:.7rem;color:rgba(255,255,255,.4);}',
    ].join('');

    var railBanner = document.createElement('div');
    railBanner.id = 'sch-rail-banner';
    railBanner.innerHTML = [
      '<style>' + railCSS + '</style>',
      '<div class="schr-stars">' + starSVG.repeat(5) + '&nbsp;4.9 on G2</div>',
      '<h3 class="schr-headline">See SubcontractorHub in 30 minutes.</h3>',
      '<p class="schr-sub">The all-in-one platform for roofing, solar &amp; HVAC.</p>',
      '<div class="schr-divider"></div>',
      '<div class="schr-feature">' + checkSVG + '<span>AI quoting &amp; proposals</span></div>',
      '<div class="schr-feature">' + checkSVG + '<span>Project management</span></div>',
      '<div class="schr-feature">' + checkSVG + '<span>Faster payments</span></div>',
      '<a href="' + demoLink('blog-rail-banner') + '" class="schr-btn" target="_blank" rel="noopener">Book a Free Demo &rarr;</a>',
      '<span class="schr-note">No commitment &middot; 30 minutes</span>',
    ].join('');

    if (formCol) {
      formCol.innerHTML = '';
      formCol.appendChild(railBanner);
    } else {
      form.parentNode.replaceChild(railBanner, form);
    }

    // ── 2. Mid-article inline banner (inserted after the row) ────────────────
    var midCSS = [
      '#sch-blog-banner{background:linear-gradient(135deg,#1a1f6e 0%,#2d3282 50%,#1e2875 100%);border-radius:14px;padding:32px 36px;margin:40px 0;display:flex;align-items:center;justify-content:space-between;gap:24px;box-shadow:0 8px 40px rgba(26,31,110,.35);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-sizing:border-box;}',
      '@media(max-width:640px){#sch-blog-banner{flex-direction:column;text-align:center;padding:28px 24px;}}',
      '#sch-blog-banner .schb-left{flex:1;min-width:0;}',
      '#sch-blog-banner .schb-stars{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-weight:700;color:#fbbf24;margin-bottom:10px;letter-spacing:.03em;background:rgba(251,191,36,.12);padding:3px 10px;border-radius:20px;}',
      '#sch-blog-banner .schb-stars svg{width:12px;height:12px;fill:#fbbf24;}',
      '#sch-blog-banner .schb-headline{color:#fff;font-size:1.35rem;font-weight:800;line-height:1.25;margin:0 0 8px;}',
      '#sch-blog-banner .schb-sub{color:rgba(255,255,255,.72);font-size:.9rem;line-height:1.5;margin:0;}',
      '#sch-blog-banner .schb-right{flex-shrink:0;}',
      '#sch-blog-banner .schb-btn{display:inline-block;background:#f59e0b;color:#1a1f6e !important;font-weight:800;font-size:.95rem;padding:14px 28px;border-radius:9px;text-decoration:none;white-space:nowrap;box-shadow:0 4px 16px rgba(245,158,11,.45);transition:background .15s,transform .1s;letter-spacing:.01em;}',
      '#sch-blog-banner .schb-btn:hover{background:#d97706;transform:translateY(-1px);}',
      '#sch-blog-banner .schb-note{display:block;margin-top:8px;font-size:.75rem;color:rgba(255,255,255,.45);text-align:center;}',
    ].join('');

    var midBanner = document.createElement('div');
    midBanner.id = 'sch-blog-banner';
    midBanner.innerHTML = [
      '<style>' + midCSS + '</style>',
      '<div class="schb-left">',
        '<span class="schb-stars">' + starSVG.repeat(5) + '&nbsp;4.9 on G2</span>',
        '<h3 class="schb-headline">See SubcontractorHub in 30 minutes.</h3>',
        '<p class="schb-sub">AI quoting, project management &amp; faster payments — all in one platform built for roofing, solar, and HVAC.</p>',
      '</div>',
      '<div class="schb-right">',
        '<a href="' + demoLink('blog-inline-banner') + '" class="schb-btn" target="_blank" rel="noopener">Book a Free Demo &rarr;</a>',
        '<span class="schb-note">No commitment &middot; 30 minutes</span>',
      '</div>',
    ].join('');

    if (row && row.parentNode) {
      row.parentNode.insertBefore(midBanner, row.nextSibling);
    }
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    injectStyles();

    // Blog: replace inline contact form with CTA banner
    replaceBlogContactForm();

    // No popups on support/legal/auth pages — they interfere with the conversion flow
    if (isExcludedPage()) return;

    // Footer bar: 1.5s delay, dismissed for 24h after user closes it
    if (!getCookie('sch_footer_dismissed')) {
      setTimeout(showFooter, 1500);
    }

    // Welcome modal: 4s delay, suppressed for 24h after first view
    if (!getCookie('sch_popup_seen')) {
      setTimeout(showPopup, 4000);
    }

    // Scroll-depth popup: fires at 40% scroll — suppressed if welcome modal
    // already fired today (avoids double-popup in same 24h window)
    if (!getCookie('sch_scroll_seen')) {
      initScrollPopup();
    }

    // Exit-intent: fires on mouse-exit toward browser chrome after 15s on page,
    // suppressed for 24h after first fire
    if (!getCookie('sch_exit_seen')) {
      initExitIntent();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
