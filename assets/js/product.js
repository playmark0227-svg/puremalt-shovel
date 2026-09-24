/* =====================================================================
 * product.js — 商品詳細ページ（product.html）専用スクリプト
 * - モデル切替タブ（剣先／角）：ARIA tablist、矢印キー／Home／End 対応
 * - 切替時に本文・価格・仕様・リンク・タイトル・URL（Shop.setModel）を更新
 * - 画像ギャラリー（メイン＋サムネイル、キーボード操作可）
 * 表示する値はすべて SITE_CONFIG（Shop 経由）から取得します。
 * ===================================================================== */
(function () {
  'use strict';

  var S = window.Shop;
  if (!S || !S.config) return;

  var SCENE_ALT = {
    kensaki: '剣先モデルで溝を掘る作業のイメージ',
    kaku: '角モデルで砂利をすくう作業のイメージ'
  };
  var RATIO = { '4x5': [1208, 1500], '16x9': [1920, 1071] };

  var current = null;
  var galleryIndex = 0;
  var galleryItems = [];

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function reducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  function otherId(id) {
    var list = S.ids();
    var i = list.indexOf(id);
    return list.length > 1 ? list[(i + 1) % list.length] : id;
  }

  /* ---------- Gallery ---------- */
  function buildGallery(p) {
    var c = S.config.commonImages || {};
    var imgs = p.images || {};
    return [
      { src: imgs.studio, ratio: '4x5', label: '製品全体', alt: p.name + ' の製品イメージ' },
      { src: imgs.scene, ratio: '16x9', label: '使用シーン', alt: SCENE_ALT[p.id] || (p.name + ' の使用イメージ') },
      { src: c.grip, ratio: '4x5', label: 'コルクグリップ', alt: 'コルクグリップと、再利用するウイスキーのコルク栓のイメージ' },
      { src: c.titanium, ratio: '16x9', label: 'チタンブレード', alt: 'チタンブレードの刃先のクローズアップイメージ' }
    ].filter(function (it) { return !!it.src; });
  }

  function setImg(img, item) {
    if (!img || !item) return;
    if (img.getAttribute('src') !== item.src) img.setAttribute('src', item.src);
    var wh = RATIO[item.ratio];
    if (wh) { img.setAttribute('width', wh[0]); img.setAttribute('height', wh[1]); }
  }

  function showImage(index) {
    if (!galleryItems.length) return;
    if (index < 0 || index >= galleryItems.length) index = 0;
    galleryIndex = index;
    var item = galleryItems[index];
    var frame = qs('.pd-gallery__main');
    var main = qs('#pd-main-img');
    if (frame) {
      frame.classList.remove('frame--4x5', 'frame--16x9');
      frame.classList.add('frame--' + item.ratio);
      frame.setAttribute('data-ratio', item.ratio);
    }
    if (main) {
      var changing = main.getAttribute('src') !== item.src;
      if (changing && !reducedMotion()) {
        main.classList.add('is-loading');
        var done = function () { main.classList.remove('is-loading'); };
        main.addEventListener('load', done, { once: true });
        main.addEventListener('error', done, { once: true });
        window.setTimeout(done, 1200);
      }
      setImg(main, item);
      main.setAttribute('alt', item.alt);
    }
    qsa('.pd-thumb').forEach(function (btn) {
      var on = Number(btn.getAttribute('data-index')) === index;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function renderThumbs() {
    qsa('.pd-thumb').forEach(function (btn) {
      var i = Number(btn.getAttribute('data-index'));
      var item = galleryItems[i];
      if (!item) { btn.hidden = true; return; }
      btn.hidden = false;
      setImg(qs('img', btn), item);
      var label = qs('[data-thumb-label]', btn);
      if (label) label.textContent = item.label + 'の画像を表示';
    });
  }

  function initGallery() {
    var thumbs = qsa('.pd-thumb');
    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        showImage(Number(btn.getAttribute('data-index')));
      });
      btn.addEventListener('keydown', function (e) {
        var visible = thumbs.filter(function (b) { return !b.hidden; });
        var pos = visible.indexOf(btn);
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = visible[(pos + 1) % visible.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = visible[(pos - 1 + visible.length) % visible.length];
        else if (e.key === 'Home') next = visible[0];
        else if (e.key === 'End') next = visible[visible.length - 1];
        if (!next) return;
        e.preventDefault();
        next.focus();
        showImage(Number(next.getAttribute('data-index')));
      });
    });
  }

  /* ---------- Spec table ---------- */
  function renderSpec(p) {
    var body = qs('#pd-spec-body');
    if (!body) return;
    var rows = [
      { label: '商品名', value: p.name },
      { label: 'モデル', value: p.variantLabel + '（' + p.variantEn + '）' }
    ];
    (p.specs || []).forEach(function (s) { rows.push(s); });
    (S.config.commonSpecs || []).forEach(function (s) { rows.push(s); });
    rows.push({ label: '販売価格', value: S.priceLabel(p.id), amber: true });
    rows.push({ label: '送料', value: S.get('shipping.label') || '' });

    var frag = document.createDocumentFragment();
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      var th = document.createElement('th');
      th.setAttribute('scope', 'row');
      th.textContent = r.label;
      var td = document.createElement('td');
      td.textContent = r.value;
      if (r.amber) td.className = 'is-amber';
      tr.appendChild(th);
      tr.appendChild(td);
      frag.appendChild(tr);
    });
    body.innerHTML = '';
    body.appendChild(frag);
  }

  function renderUses(p) {
    var ul = qs('#pd-uses');
    if (!ul || !p.uses || !p.uses.length) return;
    ul.innerHTML = '';
    p.uses.forEach(function (u) {
      var li = document.createElement('li');
      li.textContent = u;
      ul.appendChild(li);
    });
  }

  /* ---------- Render one model ---------- */
  function render(id) {
    var p = S.product(id);
    if (!p) return;
    current = p.id;
    var other = S.product(otherId(p.id));

    qsa('[data-pfield]').forEach(function (el) {
      var v = p[el.getAttribute('data-pfield')];
      if (typeof v !== 'string') return;
      if (el.classList.contains('pd-info__title')) {
        // 商品名は語（スペース区切り）の途中で改行しない
        el.textContent = '';
        v.split(' ').forEach(function (w, i) {
          if (i) el.appendChild(document.createTextNode(' '));
          var s = document.createElement('span');
          s.className = 'nobr';
          s.textContent = w;
          el.appendChild(s);
        });
      } else {
        el.textContent = v;
      }
    });
    qsa('[data-pprice]').forEach(function (el) { el.textContent = S.formatYen(p.price); });
    qsa('[data-plink="purchase"], .site-nav__cta, .footer__links a[href^="purchase.html"]').forEach(function (el) {
      el.setAttribute('href', 'purchase.html?model=' + encodeURIComponent(p.id));
    });

    var hasOther = other && other.id !== p.id;
    qsa('[data-pother-link]').forEach(function (el) {
      el.hidden = !hasOther;
      if (!hasOther) return;
      el.setAttribute('href', 'product.html?model=' + encodeURIComponent(other.id));
      el.setAttribute('data-model', other.id);
    });
    qsa('.pd-other').forEach(function (el) { el.hidden = !hasOther; });
    if (hasOther) {
      qsa('[data-pother]').forEach(function (el) {
        var v = other[el.getAttribute('data-pother')];
        if (typeof v === 'string') el.textContent = v;
      });
    }

    renderUses(p);
    renderSpec(p);

    var scene = qs('#pd-scene-img');
    if (scene && p.images && p.images.scene) {
      scene.setAttribute('src', p.images.scene);
      scene.setAttribute('alt', SCENE_ALT[p.id] || (p.name + ' の使用イメージ'));
    }

    galleryItems = buildGallery(p);
    renderThumbs();
    showImage(galleryIndex < galleryItems.length ? galleryIndex : 0);

    // tabs + panel
    qsa('.pd-tabs [role="tab"]').forEach(function (tab) {
      var on = tab.getAttribute('data-model') === p.id;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
    });
    var panel = qs('#pd-panel');
    if (panel) {
      panel.setAttribute('aria-labelledby', 'tab-' + p.id);
      panel.setAttribute('data-model', p.id);
    }

    var brand = S.get('brand.nameJa') || '';
    document.title = '商品詳細（' + p.variantLabel + '）' + (brand ? '｜' + brand : '');
  }

  /* ---------- Model selection ---------- */
  function select(id) {
    if (!S.product(id)) return;
    if (id === current) return;
    var used = S.setModel(id); // dispatches 'shop:modelchange' → render
    if (used !== current) render(used);
  }

  function initTabs() {
    var tabs = qsa('.pd-tabs [role="tab"]').filter(function (t) {
      var ok = !!S.product(t.getAttribute('data-model'));
      if (!ok) t.hidden = true;
      return ok;
    });
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab.getAttribute('data-model')); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        next.focus();
        select(next.getAttribute('data-model'));
      });
    });
  }

  function initOtherLinks() {
    qsa('[data-pother-link]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var id = a.getAttribute('data-model');
        if (!id || !S.product(id)) return;
        e.preventDefault();
        select(id);
        var top = qs('.pd-top');
        if (top && top.scrollIntoView) {
          try { top.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' }); }
          catch (err) { top.scrollIntoView(); }
        }
        var tab = qs('#tab-' + id);
        if (tab) { try { tab.focus({ preventScroll: true }); } catch (err2) { tab.focus(); } }
      });
    });
  }

  function init() {
    document.addEventListener('shop:modelchange', function (e) {
      var id = e && e.detail && e.detail.id;
      if (id && id !== current) render(id);
    });
    initTabs();
    initGallery();
    initOtherLinks();
    render(S.getModel());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
