/* ことばクエスト Ver2.3.9: PCのブラウザに限る表示モード。 */
(function (win, doc) {
  'use strict';
  var KEY = 'kotobaquest_pc_browser_display_mode_v239';
  var root = doc.documentElement;
  function eligible() {
    var nav = win.navigator || {};
    var ua = String(nav.userAgent || '');
    var platform = String(nav.platform || '');
    var isMobile = /Android|iPhone|iPad|iPod|Mobile|Tablet|Kindle|Silk|PlayBook|BlackBerry|webOS|Opera Mini|Windows Phone/i.test(ua);
    var ipadDesktopUA = platform === 'MacIntel' && Number(nav.maxTouchPoints || 0) > 1;
    var nativeApp = Boolean(win.KotobaNativeBridge || win.AndroidSpeech || win.AndroidFiles || win.AndroidPrint || win.Capacitor || win.cordova || win.ReactNativeWebView || win.KotobaIOSBridge);
    var installed = Boolean(nav.standalone || (win.matchMedia && win.matchMedia('(display-mode: standalone)').matches));
    return !isMobile && !ipadDesktopUA && !nativeApp && !installed;
  }
  function load() {
    try { var v=win.localStorage.getItem(KEY);return v==='mobile'||v==='tablet'?v:'desktop'; }
    catch (_) { return 'desktop'; }
  }
  function apply(mode) {
    var active = eligible() ? (mode === 'mobile'||mode === 'tablet' ? mode : 'desktop') : 'desktop';
    root.classList.toggle('kq-pc-mobile-view', active === 'mobile');
    root.classList.toggle('kq-pc-tablet-view', active === 'tablet');
    root.dataset.kqPcDisplay = active;
    return active;
  }
  function init() {
    var panel = doc.getElementById('kqBrowserDisplayPanel');
    var status = doc.getElementById('kqBrowserDisplayStatus');
    if (!panel) return;
    if (!eligible()) { panel.hidden = true; apply('desktop'); return; }
    panel.hidden = false;
    var buttons = Array.prototype.slice.call(doc.querySelectorAll('input[name="kqBrowserDisplayMode"]'));
    var current = load();
    apply(current);
    buttons.forEach(function (b) { b.checked = (b.value === current); });
    if (status) status.textContent = '現在：'+(current==='mobile'?'モバイル':current==='tablet'?'タブレット':'デスクトップ')+'モード';
    function saveChoice() {
      if (!eligible()) return;
      var chosen = buttons.filter(function (b) { return b.checked; })[0];
      var mode = chosen && (chosen.value === 'mobile'||chosen.value === 'tablet') ? chosen.value : 'desktop';
      try { win.localStorage.setItem(KEY, mode); } catch (_) { /* 保存できない環境でも一時反映 */ }
      apply(mode);
      if (status) status.textContent = (mode==='mobile'?'モバイル':mode==='tablet'?'タブレット':'デスクトップ')+'モードを保存しました';
    }
    // 既存の「設定を保存」ボタンを共用。PCブラウザのみ反映する。
    var save = doc.getElementById('settingsSaveBtn');
    if (save) save.addEventListener('click', saveChoice);
    // 既存の設定画面は閉じると未確定のラジオが残るため、画面を開く時に保存値へ同期。
    var triggers = ['titleSettingsBtn', 'genreSettingsBtn'];
    triggers.forEach(function (id) {
      var trigger = doc.getElementById(id);
      if (trigger) trigger.addEventListener('click', function () {
        var saved = load();
        buttons.forEach(function (b) { b.checked = b.value === saved; });
        if (status) status.textContent = '現在：'+(saved==='mobile'?'モバイル':saved==='tablet'?'タブレット':'デスクトップ')+'モード';
      });
    });
  }
  // before DOM is ready, apply saved setting to reduce flicker and support later visits.
  apply(load());
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
  win.KotobaPCBrowserDisplay = { eligible: eligible, apply: apply, init: init };
})(window, document);
