/* =====================================================================
 * purchase.js — ご注文内容の確認（最終確認画面）
 * - モデル選択（?model= で初期選択 / 切替で Shop.setModel）
 * - ご注文内容（価格・送料・合計）を SITE_CONFIG から表示
 * - 確認チェックが入るまで「Stripeの決済画面へ進む」を無効化
 * - Stripe決済リンク未設定時はデモ表示
 * main.js の後に読み込むこと。
 * ===================================================================== */
(function () {
  'use strict';

  function qsa(sel, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); } catch (e) { return []; }
  }
  function setText(key, text) {
    qsa('[data-summary="' + key + '"]').forEach(function (el) { el.textContent = text; });
  }

  function init() {
    var Shop = window.Shop;
    if (!Shop) return;

    var radios = qsa('input[type="radio"][name="model"]');
    var agree = document.getElementById('agree');
    var btn = document.getElementById('checkout-btn');
    var hint = document.getElementById('agree-hint');
    var demoNotice = document.getElementById('demo-notice');
    var demoInline = document.getElementById('demo-inline');
    var current = Shop.getModel();

    /* ---------- ご注文内容の描画 ---------- */
    function shippingText() {
      var ship = Shop.config.shipping || {};
      var fee = Number(ship.fee) || 0;
      return {
        amount: Shop.formatYen(fee),
        label: fee === 0
          ? (ship.label ? '（' + ship.label + '）' : '（無料）')
          : '（税込）'
      };
    }

    function render(id) {
      var p = Shop.product(id);
      if (!p) return;
      current = id;

      radios.forEach(function (r) {
        var on = r.value === id;
        r.checked = on;
        var card = r.closest ? r.closest('.radio-card') : r.parentNode;
        if (card) card.classList.toggle('is-checked', on);
      });

      var ship = shippingText();
      setText('name', p.name || '');
      setText('variant', p.variantLabel || '');
      setText('variantEn', p.variantEn || '');
      setText('price', Shop.formatYen(p.price));
      setText('shipping', ship.amount);
      setText('shippingLabel', ship.label);
      setText('total', Shop.formatYen(Shop.totalFor(id, 1)));

      // 戻る／商品詳細リンク
      qsa('.js-product-link').forEach(function (a) {
        a.setAttribute('data-href-product', id);
        a.setAttribute('href', 'product.html?model=' + encodeURIComponent(id));
      });
      // ヘッダー「購入する」・フッター「ご購入」も選択中モデルを保持
      qsa('.site-nav__cta, .footer__links a[href^="purchase.html"]').forEach(function (a) {
        a.setAttribute('href', 'purchase.html?model=' + encodeURIComponent(id));
      });

      // 決済ボタンの遷移先
      var demo = Shop.isDemo(id);
      if (btn) {
        btn.setAttribute('href', Shop.checkoutHref(id));
        if (demo) btn.removeAttribute('rel');
        else btn.setAttribute('rel', 'noopener');
      }
      if (demoNotice) demoNotice.hidden = !demo;
      if (demoInline) demoInline.hidden = !demo;
    }

    /* ---------- 確認チェックとボタンの有効化 ---------- */
    function syncGate() {
      var ok = !!(agree && agree.checked);
      if (btn) {
        if (ok) {
          btn.removeAttribute('aria-disabled');
          btn.classList.remove('is-disabled');
          btn.setAttribute('aria-describedby', 'checkout-note');
        } else {
          btn.setAttribute('aria-disabled', 'true');
          btn.setAttribute('aria-describedby', 'checkout-note agree-hint');
        }
      }
      if (hint) hint.hidden = ok;
    }

    if (agree) {
      agree.addEventListener('change', syncGate);
    }

    if (btn) {
      btn.addEventListener('click', function (e) {
        if (agree && !agree.checked) {
          e.preventDefault();
          if (hint) {
            hint.hidden = false;
            hint.classList.remove('is-flash');
            // リフローを挟んで強調アニメーションを再生
            void hint.offsetWidth;
            hint.classList.add('is-flash');
          }
          try { agree.focus(); } catch (err) { /* noop */ }
          return;
        }
        // 念のため、クリック時点の選択モデルで遷移先を確定
        btn.setAttribute('href', Shop.checkoutHref(current));
      });
    }

    /* ---------- モデル切替 ---------- */
    radios.forEach(function (r) {
      r.addEventListener('change', function () {
        if (r.checked) Shop.setModel(r.value);
      });
    });
    document.addEventListener('shop:modelchange', function (e) {
      var id = e && e.detail && e.detail.id;
      if (id) render(id);
    });

    // ブラウザの「戻る」で復元された場合もチェック状態とボタンを同期
    window.addEventListener('pageshow', function () {
      var checked = radios.filter(function (r) { return r.checked; })[0];
      render(checked && Shop.product(checked.value) ? checked.value : current);
      syncGate();
    });

    /* ---------- サマリーの固定表示（デスクトップ・画面に収まる場合のみ） ---------- */
    var summary = document.getElementById('summary');
    function fitSticky() {
      if (!summary) return;
      var headerH = 72;
      try {
        var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'));
        if (v > 0) headerH = v;
      } catch (e) { /* noop */ }
      var fits = window.innerWidth >= 1024 &&
        summary.offsetHeight + headerH + 48 <= window.innerHeight;
      summary.classList.toggle('is-sticky', fits);
    }
    var fitTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(fitTimer);
      fitTimer = setTimeout(fitSticky, 120);
    });
    window.addEventListener('load', fitSticky);
    document.addEventListener('shop:modelchange', function () { setTimeout(fitSticky, 0); });

    render(current);
    syncGate();
    fitSticky();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
