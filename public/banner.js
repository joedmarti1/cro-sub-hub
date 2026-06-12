/**
 * SubcontractorHub — CRO Banner Suite
 * Drop this script in GTM or paste into <head> on subcontractorhub.com
 * Hosted: https://cro-sub-hub.vercel.app/banner.js
 */
(function () {
  'use strict';

  var DEMO_URL = 'https://app.subcontractorhub.com/sch-book-a-demo';
  var UTM_BASE = '?utm_source=site&utm_medium=popup&utm_campaign=lead-capture';

  // ── Helpers ────────────────────────────────────────────────────────────────
  function demoLink(content) {
    return DEMO_URL + UTM_BASE + '&utm_content=' + content;
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
      '<span class="sch-f-sub">AI quoting · project management · faster payments — one platform.</span>',
      '<a href="' + demoLink('sticky-footer-bar') + '" class="sch-f-btn" target="_blank" rel="noopener">Book a Demo</a>',
      '<button class="sch-f-close" aria-label="Close">&#215;</button>',
    ].join('');

    document.body.appendChild(bar);

    // add body padding so content isn't hidden behind the bar
    var prev = parseInt(document.body.style.paddingBottom || 0, 10);
    document.body.style.paddingBottom = (prev + 56) + 'px';

    bar.querySelector('.sch-f-close').addEventListener('click', function () {
      bar.remove();
      sessionStorage.setItem('sch_footer_dismissed', '1');
      document.body.style.paddingBottom = prev + 'px';
    });
  }

  // ── Popup modal ────────────────────────────────────────────────────────────
  function showPopup() {
    if (document.getElementById('sch-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'sch-overlay';
    overlay.innerHTML = [
      '<div id="sch-modal">',
      '  <button class="sch-close" aria-label="Close">&#215;</button>',
      '  <div class="sch-pill">SubcontractorHub Platform</div>',
      '  <h2>More Jobs. Less Chaos.</h2>',
      '  <p>The all-in-one platform for roofing, solar, and HVAC businesses — AI quoting, project management, and faster payments from one login.</p>',
      '  <a href="' + demoLink('primary-modal-popup') + '" class="sch-cta-btn" target="_blank" rel="noopener">Book a Demo &#8594;</a>',
      '  <p class="sch-micro">Free demo. No commitment.</p>',
      '  <button class="sch-no-thanks">No thanks</button>',
      '</div>',
    ].join('');

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    sessionStorage.setItem('sch_popup_seen', '1');

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

  // ── Blog contact-form → CTA banner ────────────────────────────────────────
  function replaceBlogContactForm() {
    if (!/\/blog\b/i.test(window.location.pathname)) return;

    // Try common selectors first, then fall back to heading-text scan
    var target = document.querySelector('#getintouch, #get-in-touch, [id*="contact-form"], [id*="contact_form"]');
    if (!target) {
      var headings = document.querySelectorAll('h2, h3');
      for (var i = 0; i < headings.length; i++) {
        if (/get in touch/i.test(headings[i].textContent)) {
          // Walk up to the section/div that wraps the whole form block
          var el = headings[i];
          while (el.parentElement && el.parentElement.tagName !== 'MAIN' && el.parentElement.tagName !== 'ARTICLE' && el.parentElement.tagName !== 'BODY') {
            if (el.parentElement.querySelector('form, input[type="email"]')) {
              el = el.parentElement;
              break;
            }
            el = el.parentElement;
          }
          target = el;
          break;
        }
      }
    }
    if (!target) return;

    var banner = document.createElement('div');
    banner.id = 'sch-blog-banner';

    var css = [
      '#sch-blog-banner{',
        'background:linear-gradient(135deg,#1a1f6e 0%,#2d3282 50%,#1e2875 100%);',
        'border-radius:14px;',
        'padding:32px 36px;',
        'margin:40px 0;',
        'display:flex;',
        'align-items:center;',
        'justify-content:space-between;',
        'gap:24px;',
        'box-shadow:0 8px 40px rgba(26,31,110,.35);',
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
        'box-sizing:border-box;',
      '}',
      '@media(max-width:640px){#sch-blog-banner{flex-direction:column;text-align:center;padding:28px 24px;}}',
      '#sch-blog-banner .schb-left{flex:1;min-width:0;}',
      '#sch-blog-banner .schb-stars{',
        'display:inline-flex;align-items:center;gap:6px;',
        'font-size:.75rem;font-weight:700;color:#fbbf24;',
        'margin-bottom:10px;letter-spacing:.03em;',
        'background:rgba(251,191,36,.12);padding:3px 10px;border-radius:20px;',
      '}',
      '#sch-blog-banner .schb-stars svg{width:12px;height:12px;fill:#fbbf24;}',
      '#sch-blog-banner .schb-headline{',
        'color:#fff;font-size:1.35rem;font-weight:800;line-height:1.25;',
        'margin:0 0 8px;',
      '}',
      '#sch-blog-banner .schb-sub{',
        'color:rgba(255,255,255,.72);font-size:.9rem;line-height:1.5;margin:0;',
      '}',
      '#sch-blog-banner .schb-right{flex-shrink:0;}',
      '#sch-blog-banner .schb-btn{',
        'display:inline-block;',
        'background:#f59e0b;',
        'color:#1a1f6e !important;',
        'font-weight:800;font-size:.95rem;',
        'padding:14px 28px;border-radius:9px;',
        'text-decoration:none;white-space:nowrap;',
        'box-shadow:0 4px 16px rgba(245,158,11,.45);',
        'transition:background .15s,transform .1s;',
        'letter-spacing:.01em;',
      '}',
      '#sch-blog-banner .schb-btn:hover{background:#d97706;transform:translateY(-1px);}',
      '#sch-blog-banner .schb-note{',
        'display:block;margin-top:8px;',
        'font-size:.75rem;color:rgba(255,255,255,.45);text-align:center;',
      '}',
    ].join('');

    var starSVG = '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    var stars = starSVG.repeat(5);

    banner.innerHTML = [
      '<style>' + css + '</style>',
      '<div class="schb-left">',
        '<span class="schb-stars">' + stars + '&nbsp;4.9 on G2</span>',
        '<h3 class="schb-headline">See SubcontractorHub in 30 minutes.</h3>',
        '<p class="schb-sub">AI quoting, project management & faster payments — all in one platform built for roofing, solar, and HVAC.</p>',
      '</div>',
      '<div class="schb-right">',
        '<a href="' + demoLink('blog-inline-banner') + '" class="schb-btn" target="_blank" rel="noopener">',
          'Book a Free Demo &rarr;',
        '</a>',
        '<span class="schb-note">No commitment &middot; 30 minutes</span>',
      '</div>',
    ].join('');

    target.parentNode.replaceChild(banner, target);
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    injectStyles();

    // Blog: replace inline contact form with CTA banner
    replaceBlogContactForm();

    // Footer: 1.5s delay, once per session
    if (!sessionStorage.getItem('sch_footer_dismissed')) {
      setTimeout(showFooter, 1500);
    }

    // Popup: 4s delay, once per session
    if (!sessionStorage.getItem('sch_popup_seen')) {
      setTimeout(showPopup, 4000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
