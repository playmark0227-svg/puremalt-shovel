/* =====================================================================
 * thanks.js — 購入完了画面
 * - ?demo=1 のときはデモ表示（バナー・見出し切替）
 * - ?model= が有効なら「ご注文モデル」を表示（session_id は使用しない）
 * main.js の後に読み込むこと。
 * ===================================================================== */
(function () {
  'use strict';

  function getParam(name) {
    try {
      if (window.URLSearchParams) return new URLSearchParams(window.location.search).get(name);
    } catch (e) { /* fall through */ }
    try {
      var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search || '');
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
    } catch (e2) { return null; }
  }

  function qsa(sel) {
    try { return Array.prototype.slice.call(document.querySelectorAll(sel)); } catch (e) { return []; }
  }

  function init() {
    var Shop = window.Shop;
    var demo = getParam('demo') === '1';

    qsa('[data-demo-only]').forEach(function (el) { el.hidden = !demo; });
    qsa('[data-live-only]').forEach(function (el) { el.hidden = demo; });

    var title = document.getElementById('thanks-title');
    if (demo) {
      if (title) title.innerHTML = 'デモ：<wbr>購入完了画面の<wbr>表示確認';
      try { document.title = 'デモ：購入完了画面の表示確認｜ピュアモルト チタンスコップ'; } catch (e) { /* noop */ }
    }

    // ご注文モデル（URLの model が有効な場合のみ）
    var model = getParam('model');
    var p = (Shop && model && Shop.ids().indexOf(model) !== -1) ? Shop.product(model) : null;
    var row = document.getElementById('thanks-model');
    var nameEl = document.getElementById('thanks-model-name');
    if (p && row && nameEl) {
      nameEl.textContent = p.name || '';
      row.hidden = false;
    }

    var back = document.getElementById('thanks-back-purchase');
    if (back) {
      back.setAttribute('href', 'purchase.html' + (p ? '?model=' + encodeURIComponent(model) : ''));
    }

    // メールアドレスが設定済みなら mailto リンクにする
    var emailEl = document.getElementById('seller-email');
    var email = Shop ? Shop.get('seller.email') : '';
    if (emailEl && email && !Shop.isPlaceholder(email) && /^[^\s@]+@[^\s@]+$/.test(String(email))) {
      var a = document.createElement('a');
      a.href = 'mailto:' + String(email);
      a.textContent = String(email);
      emailEl.textContent = '';
      emailEl.appendChild(a);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
