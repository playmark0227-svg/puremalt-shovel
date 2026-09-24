/* =====================================================================
 * index.js — LP（index.html）専用スクリプト
 *  - スペック比較表を SITE_CONFIG から描画（HTML内の静的な表はフォールバック）
 *  - モバイル固定CTAの表示制御（ヒーロー・最終CTA表示中は隠す）
 * main.js の後に読み込むこと。classic script / file:// でも動作。
 * ===================================================================== */
(function () {
  'use strict';

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'className') node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function specValue(p, label) {
    var list = (p && Array.isArray(p.specs)) ? p.specs : [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].label === label) return list[i].value;
    }
    return '—';
  }

  /* ---------- スペック比較表 ---------- */
  function renderSpecTable() {
    var Shop = window.Shop;
    var table = document.getElementById('spec-table');
    if (!Shop || !table) return;
    var prods = Shop.products();
    if (!prods.length) return;
    var cfg = Shop.config || {};
    var cols = prods.length;

    // thead
    var thead = el('thead');
    var hr = el('tr');
    hr.appendChild(el('td'));
    prods.forEach(function (p) {
      var th = el('th', { scope: 'col' }, p.variantEn || p.variantLabel || '');
      th.appendChild(el('small', null, p.variantLabel || ''));
      hr.appendChild(th);
    });
    thead.appendChild(hr);

    // tbody
    var tbody = el('tbody');
    function addRow(label, cells, cellClass) {
      var tr = el('tr');
      tr.appendChild(el('th', { scope: 'row' }, label));
      cells.forEach(function (v) {
        tr.appendChild(el('td', cellClass ? { className: cellClass } : null, v));
      });
      tbody.appendChild(tr);
    }
    function addCommonRow(label, value) {
      var tr = el('tr');
      tr.appendChild(el('th', { scope: 'row' }, label));
      tr.appendChild(el('td', { colspan: String(cols) }, value));
      tbody.appendChild(tr);
    }

    addRow('販売価格', prods.map(function (p) { return Shop.priceLabel(p.id); }), 'is-amber');

    // 各モデル specs のラベルを出現順に統合
    var labels = [];
    prods.forEach(function (p) {
      (Array.isArray(p.specs) ? p.specs : []).forEach(function (s) {
        if (s && s.label && labels.indexOf(s.label) === -1) labels.push(s.label);
      });
    });
    labels.forEach(function (label) {
      addRow(label, prods.map(function (p) { return specValue(p, label); }));
    });

    addRow('主な用途', prods.map(function (p) {
      return Array.isArray(p.uses) ? p.uses.join('、') : (p.uses || '—');
    }));

    (Array.isArray(cfg.commonSpecs) ? cfg.commonSpecs : []).forEach(function (s) {
      if (s && s.label) addCommonRow(s.label, s.value);
    });

    var ship = cfg.shipping || {};
    var shipText = ship.label || (Number(ship.fee) > 0 ? Shop.formatYen(ship.fee) + '（税込）' : '');
    if (shipText) addCommonRow('送料', shipText);

    var oldHead = table.querySelector('thead');
    var oldBody = table.querySelector('tbody');
    if (oldHead) table.replaceChild(thead, oldHead); else table.appendChild(thead);
    if (oldBody) table.replaceChild(tbody, oldBody); else table.appendChild(tbody);
  }

  /* ---------- モバイル固定CTA ---------- */
  function initStickyCta() {
    var bar = document.querySelector('.sticky-cta');
    if (!bar) return;
    var targets = ['hero', 'cta'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!targets.length || !('IntersectionObserver' in window)) return; // 常に表示
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
      var hide = Object.keys(visible).some(function (k) { return visible[k]; });
      if (hide) bar.classList.add('is-hidden');
      else bar.classList.remove('is-hidden');
      bar.setAttribute('aria-hidden', hide ? 'true' : 'false');
      Array.prototype.forEach.call(bar.querySelectorAll('a, button'), function (a) {
        if (hide) a.setAttribute('tabindex', '-1'); else a.removeAttribute('tabindex');
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }

  function safe(fn) {
    try { fn(); } catch (e) {
      if (window.console && console.error) console.error('[index.js]', e);
    }
  }

  /* FAQ「重さ」: 仕様を並び順ではなくラベル「重量」で参照（静的テキストはフォールバック） */
  function renderFaqWeight() {
    var S = window.Shop;
    if (!S) return;
    Array.prototype.slice.call(document.querySelectorAll('[data-faq-weight]')).forEach(function (el) {
      var id = el.getAttribute('data-faq-weight');
      if (S.ids().indexOf(id) === -1) return;
      var v = specValue(S.product(id), '重量');
      if (v && v !== '—' && v !== '-') el.textContent = v;
    });
  }

  function init() {
    safe(renderSpecTable);
    safe(renderFaqWeight);
    safe(initStickyCta);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
