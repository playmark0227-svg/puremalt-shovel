/* =====================================================================
 * legal.js — 特定商取引法に基づく表記 / プライバシーポリシー
 * config.js（SITE_CONFIG）の値を反映します。main.js の後に読み込むこと。
 * HTML には config と同じ内容の静的フォールバックを記載済みです。
 * ===================================================================== */
(function () {
  'use strict';

  function qsa(sel, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); } catch (e) { return []; }
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }

  // 販売価格：全商品を「商品名：¥00,000（税込）」で一覧表示
  function renderPrices(Shop) {
    var list = Shop.products();
    if (!list.length) return;
    qsa('[data-legal="prices"]').forEach(function (ul) {
      ul.innerHTML = '';
      list.forEach(function (p) {
        var li = el('li');
        li.appendChild(el('span', null, p.name || p.variantLabel || ''));
        li.appendChild(document.createTextNode('：'));
        li.appendChild(el('span', 'legal-price', Shop.priceLabel(p.id)));
        ul.appendChild(li);
      });
    });
  }

  // 送料：0円なら表示ラベル（例：全国送料無料）、有料なら金額（税込）
  function renderShipping(Shop) {
    var s = (Shop.config && Shop.config.shipping) || {};
    var fee = Number(s.fee) || 0;
    var label = s.label ? String(s.label) : '';
    var text;
    if (fee > 0) text = Shop.formatYen(fee) + '（税込）' + (label ? '／' + label : '');
    else text = label || '無料';
    qsa('[data-legal="shipping"]').forEach(function (n) { n.textContent = text; });
    if (!s.note) {
      qsa('[data-bind="shipping.note"]').forEach(function (n) { n.hidden = true; });
    }
  }

  // 事業者情報に【要入力】が残っている場合のみ案内を表示
  function togglePlaceholderNotice(Shop) {
    var seller = (Shop.config && Shop.config.seller) || {};
    var keys = ['name', 'representative', 'address', 'phone', 'email', 'hours'];
    var pending = keys.some(function (k) { return Shop.isPlaceholder(seller[k]); });
    qsa('[data-legal="placeholder-notice"]').forEach(function (n) { n.hidden = !pending; });
  }

  // メールアドレスが入力済みなら mailto リンクにする
  function linkEmail(Shop) {
    var email = Shop.get('seller.email');
    if (typeof email !== 'string') return;
    email = email.trim();
    if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email)) return;
    qsa('[data-legal="mail"]').forEach(function (n) {
      if (n.querySelector('a')) return;
      n.textContent = '';
      var a = el('a', null, email);
      a.setAttribute('href', 'mailto:' + email);
      n.appendChild(a);
    });
  }

  function init() {
    var Shop = window.Shop;
    if (!Shop) return;
    var steps = [renderPrices, renderShipping, togglePlaceholderNotice];
    steps.forEach(function (fn) {
      try { fn(Shop); } catch (e) { if (window.console) console.error('[legal.js]', e); }
    });
    try { Shop.bind(document.getElementById('main') || document); } catch (e2) { /* noop */ }
    try { linkEmail(Shop); } catch (e3) { /* noop */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
