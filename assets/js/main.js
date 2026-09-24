/* =====================================================================
 * main.js — 共通スクリプト（ヘッダー／フッター描画・window.Shop API）
 * config.js の後に読み込むこと。classic script / file:// でも動作。
 * ===================================================================== */
(function () {
  'use strict';

  var CONFIG = window.SITE_CONFIG || {};
  var PLACEHOLDER = '【要入力】';

  function qs(sel, root) {
    try { return (root || document).querySelector(sel); } catch (e) { return null; }
  }
  function qsa(sel, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); } catch (e) { return []; }
  }

  /* ---------- Shop API ---------- */
  function ids() {
    var order = Array.isArray(CONFIG.productOrder) ? CONFIG.productOrder : [];
    var prods = CONFIG.products || {};
    var list = order.filter(function (id) { return !!prods[id]; });
    if (!list.length) list = Object.keys(prods);
    return list;
  }

  function isValidId(id) {
    return typeof id === 'string' && ids().indexOf(id) !== -1;
  }

  function defaultId() {
    var list = ids();
    return list.indexOf('kensaki') !== -1 ? 'kensaki' : (list[0] || 'kensaki');
  }

  function getParam(name) {
    try {
      if (window.URLSearchParams) {
        return new URLSearchParams(window.location.search).get(name);
      }
    } catch (e) { /* fall through */ }
    try {
      var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search || '');
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
    } catch (e2) { return null; }
  }

  function getModel() {
    var m = getParam('model');
    return isValidId(m) ? m : defaultId();
  }

  function setModel(id) {
    if (!isValidId(id)) id = defaultId();
    try {
      var url;
      if (window.URL && window.URLSearchParams) {
        url = new URL(window.location.href);
        url.searchParams.set('model', id);
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
      } else {
        window.history.replaceState(window.history.state, '', '?model=' + encodeURIComponent(id) + (window.location.hash || ''));
      }
    } catch (e) { /* file:// など replaceState 不可の環境では URL 更新をスキップ */ }
    try {
      var ev;
      if (typeof window.CustomEvent === 'function') {
        ev = new CustomEvent('shop:modelchange', { detail: { id: id } });
      } else {
        ev = document.createEvent('CustomEvent');
        ev.initCustomEvent('shop:modelchange', false, false, { id: id });
      }
      document.dispatchEvent(ev);
    } catch (e3) { /* noop */ }
    return id;
  }

  function product(id) {
    var prods = CONFIG.products || {};
    return Object.prototype.hasOwnProperty.call(prods, id) ? (prods[id] || null) : null;
  }

  function products() {
    return ids().map(function (id) { return product(id); }).filter(Boolean);
  }

  function lowestPrice() {
    var prices = products().map(function (p) { return Number(p.price) || 0; }).filter(function (n) { return n > 0; });
    return prices.length ? Math.min.apply(null, prices) : 0;
  }

  function formatYen(n) {
    var num = Math.round(Number(n) || 0);
    var s = String(Math.abs(num)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (num < 0 ? '-' : '') + '¥' + s;
  }

  function priceLabel(id) {
    var p = product(id);
    return p ? formatYen(p.price) + '（税込）' : '';
  }

  function shippingFee() {
    return Number((CONFIG.shipping || {}).fee) || 0;
  }

  function totalFor(id, qty) {
    var p = product(id);
    if (!p) return 0;
    var q = (qty === undefined || qty === null) ? 1 : Number(qty);
    if (!isFinite(q) || q < 1) q = 1;
    return (Number(p.price) || 0) * q + shippingFee();
  }

  function isDemo(id) {
    var p = product(id);
    return !p || !p.stripePaymentLink || !String(p.stripePaymentLink).trim();
  }

  function checkoutHref(id) {
    if (!isValidId(id)) id = defaultId();
    var p = product(id);
    if (!isDemo(id)) return String(p.stripePaymentLink).trim();
    return 'thanks.html?demo=1&model=' + encodeURIComponent(id);
  }

  function get(path) {
    if (path === undefined || path === null || path === '') return undefined;
    var parts = String(path).split('.');
    var cur = CONFIG;
    for (var i = 0; i < parts.length; i++) {
      if (cur === null || cur === undefined) return undefined;
      var key = parts[i];
      if (Array.isArray(cur) && /^\d+$/.test(key)) key = parseInt(key, 10);
      cur = cur[key];
    }
    return cur;
  }

  function isPlaceholder(v) {
    return v === PLACEHOLDER;
  }

  function bind(root) {
    root = root || document;
    qsa('[data-bind]', root).forEach(function (el) {
      var v = get(el.getAttribute('data-bind'));
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) v = v.join('、');
      if (typeof v === 'object') return;
      el.textContent = String(v);
      if (isPlaceholder(v)) el.classList.add('placeholder');
      else el.classList.remove('placeholder');
    });
    qsa('[data-price]', root).forEach(function (el) {
      var key = el.getAttribute('data-price');
      var n = key === 'lowest' ? lowestPrice() : (product(key) ? product(key).price : null);
      if (n !== null && n !== undefined) el.textContent = formatYen(n);
    });
    qsa('[data-href-product]', root).forEach(function (el) {
      var id = el.getAttribute('data-href-product');
      if (!isValidId(id)) id = defaultId();
      el.setAttribute('href', 'product.html?model=' + encodeURIComponent(id));
    });
    qsa('[data-href-purchase]', root).forEach(function (el) {
      var id = el.getAttribute('data-href-purchase');
      if (!isValidId(id)) id = defaultId();
      el.setAttribute('href', 'purchase.html?model=' + encodeURIComponent(id));
    });
    return root;
  }

  window.Shop = {
    config: CONFIG,
    ids: ids,
    getModel: getModel,
    setModel: setModel,
    product: product,
    products: products,
    lowestPrice: lowestPrice,
    formatYen: formatYen,
    priceLabel: priceLabel,
    totalFor: totalFor,
    isDemo: isDemo,
    checkoutHref: checkoutHref,
    get: get,
    isPlaceholder: isPlaceholder,
    bind: bind
  };

  /* ---------- Header / Footer ---------- */
  var HEADER_HTML =
    '<div class="container header__inner">' +
      '<a class="brand" href="index.html" aria-label="ピュアモルト チタンスコップ トップへ">' +
        '<span class="brand__mark ti-text">PURE MALT</span><span class="brand__sub">TITANIUM SHOVEL</span>' +
      '</a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">' +
        '<span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span><span class="sr-only">メニュー</span>' +
      '</button>' +
      '<nav id="site-nav" class="site-nav" aria-label="メインメニュー">' +
        '<ul class="site-nav__list">' +
          '<li><a href="index.html#performance">特長</a></li>' +
          '<li><a href="index.html#lineup">ラインナップ</a></li>' +
          '<li><a href="index.html#spec">スペック</a></li>' +
          '<li><a href="index.html#faq">FAQ</a></li>' +
        '</ul>' +
        '<a class="btn btn--primary btn--sm site-nav__cta" href="purchase.html">購入する</a>' +
      '</nav>' +
    '</div>';

  var FOOTER_HTML =
    '<div class="container footer__inner">' +
      '<div class="footer__brand"><span class="brand__mark ti-text">PURE MALT</span><span class="brand__sub">TITANIUM SHOVEL</span></div>' +
      '<ul class="footer__links">' +
        '<li><a href="index.html#lineup">ラインナップ</a></li>' +
        '<li><a href="purchase.html">ご購入</a></li>' +
        '<li><a href="tokushoho.html">特定商取引法に基づく表記</a></li>' +
        '<li><a href="privacy.html">プライバシーポリシー</a></li>' +
      '</ul>' +
      '<p class="footer__seller">販売事業者：<span data-bind="seller.name"></span></p>' +
      '<p class="footer__copy">© <span class="js-year"></span> PURE MALT TITANIUM SHOVEL</p>' +
    '</div>';

  function renderChrome() {
    var header = document.getElementById('site-header');
    if (header && !header.children.length) header.innerHTML = HEADER_HTML;
    var footer = document.getElementById('site-footer');
    if (footer && !footer.children.length) footer.innerHTML = FOOTER_HTML;
    // 安全策：seller.name が未入力（【要入力】）のあいだはフッターの販売事業者行を出さない（特商法ページでは表示されます）
    if (footer && isPlaceholder(get('seller.name'))) {
      qsa('.footer__seller', footer).forEach(function (el) { el.hidden = true; });
    }
    var year = String(new Date().getFullYear());
    qsa('.js-year').forEach(function (el) { el.textContent = year; });
  }

  function initHeaderScroll() {
    var header = document.getElementById('site-header');
    if (!header || !document.body) return;
    var hasHero = document.body.classList.contains('has-hero');
    if (!hasHero) { header.classList.add('is-solid'); return; }
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y > 24 || document.body.classList.contains('nav-open')) header.classList.add('is-solid');
      else header.classList.remove('is-solid');
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; (window.requestAnimationFrame || setTimeout)(update); }
    }, { passive: true });
    update();
  }

  function initNav() {
    var header = document.getElementById('site-header');
    var toggle = qs('.nav-toggle', header || document);
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav || !document.body) return;

    function setOpen(open) {
      if (open) document.body.classList.add('nav-open');
      else document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      // メニュー表示中は背面のコンテンツを操作対象から外す
      [document.getElementById('main'), document.getElementById('site-footer'), qs('.sticky-cta')].forEach(function (el) {
        if (!el) return;
        if (open) el.setAttribute('inert', '');
        else el.removeAttribute('inert');
      });
      if (header) {
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        if (open || !document.body.classList.contains('has-hero') || y > 24) header.classList.add('is-solid');
        else header.classList.remove('is-solid');
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('nav-open'));
    });
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && document.body.classList.contains('nav-open')) {
        setOpen(false);
        try { toggle.focus(); } catch (err) { /* noop */ }
      }
    });
    qsa('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    // ヘッダー外をクリックしたら閉じる
    document.addEventListener('click', function (e) {
      if (!document.body.classList.contains('nav-open') || !header) return;
      if (e.target && header.contains(e.target)) return;
      setOpen(false);
    });
    // デスクトップ幅に戻ったら閉じる
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900 && document.body.classList.contains('nav-open')) setOpen(false);
    });
  }

  function initReveal() {
    var els = qsa('.reveal');
    if (!els.length) return;
    var reduced = false;
    try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* noop */ }
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  function safe(fn) {
    try { fn(); } catch (e) {
      if (window.console && console.error) console.error('[main.js]', e);
    }
  }

  function init() {
    safe(renderChrome);
    safe(initHeaderScroll);
    safe(initNav);
    safe(initReveal);
    safe(function () { bind(document); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
