// 【日本語注記】サービスワーカーはルート直下に置いてください。
// 移動するとキャッシュ適用範囲が変わるため、scripts/へは移していません。
// 画像・JS・CSSのパスを変更した場合は APP_SHELL の参照先も合わせてください。
// Previous offline cache: kotoba-quest-ver1.2.0-pc-r2
const CACHE_NAME = 'kotoba-quest-ver2.5.4a-event-images-20261123';
// Cache the small application shell during installation. Large photos, sound
// and optional recognition resources are cached only when actually requested.
// Runtime shell only. Optional 3D pages, images, media and training modes
// are fetched and cached when requested, rather than all during installation.
const APP_SHELL = [
  "./styles/training/articulation-mobile-layout-v241.css?v=241-20261119",
  "./styles/base/kq-device-layout-v250.css?v=250",
  "./styles/ui/kq-theme-patterns-v250.css?v=250",
  "./styles/training/kq-catch-game-v250.css?v=250",
  "./scripts/audio/kq-se-preview-v250.js?v=250",
  "./",
  "./index.html",
  "./START_HERE.html",
  "./credits.html",
  "./print-drills.html",
  "./kotoba-catch-lab.html",
  "./scripts/training/catch-integrated-v210.js?v=210",
  "./styles/training/catch-trial-placement-v200.css?v=210",
  "./kotoba-catch-lab.js?v=4",
  "./kotoba-catch-lab.css?v=4",
  "./scripts/games/print-drills.js?v=69",
  "./logo.html",
  "./opening-event.html",
  "./images/story/1_oji.png",
  "./images/story/2_neko.webp",
  "./images/story/2_oji.png",
  "./images/story/3_neko2.webp",
  "./images/story/3_sirasu.webp",
  "./images/story/avatar_default_01.png",
  "./images/story/avatar_default_02.png",
  "./images/story/avatar_default_03.png",
  "./images/story/avatar_default_04.png",
  "./images/story/back_1.jpg",
  "./images/story/back_2.jpg",
  "./images/story/back_3.jpg",
  "./images/story/back_4.jpg",
  "./images/story/back_5.jpg",
  "./images/story/cat_05_1.png",
  "./images/story/cat_05_2.png",
  "./images/story/cat_1.png",
  "./images/story/cat_1_crop.png",
  "./images/story/cat_1_crop2.png",
  "./images/story/cat_1_crop_2.png",
  "./images/story/m_e1097_0.png",
  "./manifest.webmanifest?v=121-image-org",
  "./manifest-premium.webmanifest",
  "./images/app-icons/icon-premium-192.png",
  "./images/app-icons/icon-premium-512.png",
  "./styles/ui/premium-theme-v121.css?v=121-premium-r2",
  "./styles/ui/free-ads-v121.css?v=121-ads-r1",
  "./scripts/system/free-ads-v121.js?v=121-ads-r1",
  "./scripts/system/premium-plan-v121.js?v=121-premium-r2",
  "./images/app-icons/icon-192.png",
  "./styles/base/style.css?v=pc-r15-4-personal-review-20261118",
  "./styles/ui/difficulty-veta11.css?v=r156",
  "./styles/base/browser-responsive.css?v=pc-r15-20261117",
  "./styles/training/v47-improvements.css?v=ver121-board-scenario-20261116",
  "./styles/training/pronunciation-training.css?v=pc-r15-20261117",
  "./styles/ai/ai-download-gate.css?v=99",
  "./styles/ui/daily-streak.css?v=r156",
  "./styles/ai/ai-quiz-v23.css?v=23",
  "./styles/base/title-responsive-beta3.css?v=3",
  "./styles/training/articulation-random-beta4.css?v=240-20261119",
  "./styles/base/browser-display-mode-v239.css?v=239-20261119",
  "./styles/base/readability-v240.css?v=240-20261119",
  "./images/practice/articulation/vowel_a.png",
  "./images/practice/articulation/vowel_i.png",
  "./images/practice/articulation/vowel_u.png",
  "./images/practice/articulation/vowel_e.png",
  "./images/practice/articulation/vowel_o.png",

  "./styles/base/responsive-beta6.css?v=6",
  "./styles/ui/veta14-ui.css?v=2",
  "./styles/ui/veta17-theme.css?v=2",
  "./styles/ui/veta19-dialogue.css?v=1",
  "./styles/training/training-revision-ver120.css?v=r2",
  "./styles/training/training-distinction-r5.css?v=r5",
  "./scripts/system/encoding-safe.js",
  "./scripts/system/android-bridge-android.js?v=beta91-audio",
  "./scripts/audio/audio-mixer-v86.js?v=91",
  "./scripts/audio/kotoba-audio-common-r5.js?v=r5",
  "./scripts/audio/kotoba-sound-pack-v2.js?v=22",
  "./scripts/audio/kotoba-sound-design-v19.js?v=23",
  "./scripts/learning/learning-mode-veta12.js?v=251",
  "./scripts/learning/adaptive-learning.js?v=251",
  "./scripts/learning/kotoba-ai-judge.js?v=253",
  "./scripts/learning/kotoba-ai-integration-v252.js?v=253",
  "./scripts/learning/personal-review-r154.js?v=20261118",
  "./scripts/system/daily-streak.js?v=r156",
  "./scripts/audio/event-message-sound.js?v=22",
  "./scripts/conversation/offline-conversation-engine.js?v=91",
  "./scripts/conversation/ai-answer-v23.js?v=23",
  "./scripts/audio/articulation-recorded-examples-v121.js?v=mi-20261116",
  "./scripts/application/app.js?v=252-20261121",
  "./scripts/system/browser-display-mode-v239.js?v=239-20261119",
  "./scripts/system/user-profile.js?v=veta17-id",
  "./scripts/learning/unified-learning-veta1.js?v=r154",
  "./scripts/training/aphasia-modes.js?v=pc-r15-1-20261117",
  "./scripts/conversation/generative-ai-chat.js?v=ver120r2",
  "./scripts/conversation/ai-download-gate.js?v=99",
  "./scripts/system/app-ui.js?v=veta17-save-theme",
  "./scripts/system/community-board.js?v=pc-r15-3-no-replies-20261118",
  "./scripts/training/reading-memory-mode.js?v=104",
  "./scripts/questions/copy-handwriting-bank-v2.js?v=jlect-choice-1",
  "./scripts/training/v47-improvements.js?v=pc-r15-1-20261117",
  "./scripts/training/v57-task-rebuild.js?v=pc-r15-1-20261117",
  "./scripts/questions/question-expansion-v10.js?v=veta10-20questions",
  "./scripts/questions/question-bank-veta11.js?v=ver121-quality-20261116",
  "./scripts/training/training-distinction-r5.js?v=ver121-board-scenario-20261116",
  "./scripts/training/pronunciation-training.js?v=pc-r15-20261117",
  "./scripts/system/kotoba-upgrades-v2.js?v=2",
  "./scripts/learning/difficulty-veta11.js?v=r156",
  "./scripts/questions/question-explanations-veta18.js?v=19",
  "./scripts/questions/question-quality-v121.js?v=quality-20261116",
  "./scripts/questions/question-limit-50-v121.js?v=20261117",
  "./scripts/training/handwriting-lazy-veta12.js?v=121-restore-handwriting",
  // 【構音ナビ】28音のアフレコを新しいvoiceフォルダーから保存します。
  "./voice/articulation/ka.mp3",
  "./voice/articulation/ki.mp3",
  "./voice/articulation/ku.mp3",
  "./voice/articulation/ke.mp3",
  "./voice/articulation/ko.mp3",
  "./voice/articulation/shi.mp3",
  "./voice/articulation/ta.mp3",
  "./voice/articulation/chi.mp3",
  "./voice/articulation/te.mp3",
  "./voice/articulation/to.mp3",
  "./voice/articulation/na.mp3",
  "./voice/articulation/ne.mp3",
  "./voice/articulation/ha.mp3",
  "./voice/articulation/he.mp3",
  "./voice/articulation/ho.mp3",
  "./voice/articulation/ma.mp3",
  "./voice/articulation/mi.mp3",
  "./voice/articulation/mu.mp3",
  "./voice/articulation/me.mp3",
  "./voice/articulation/mo.mp3",
  "./voice/articulation/ya.mp3",
  "./voice/articulation/yu.mp3",
  "./voice/articulation/yo.mp3",
  "./voice/articulation/fa.mp3",
  "./voice/articulation/fi.mp3",
  "./voice/articulation/fe.mp3",
  "./voice/articulation/fo.mp3",
  "./voice/articulation/va.mp3",
  "./fontawesome/webfonts/fa-solid-900.woff2",
  "./fontawesome/webfonts/fa-regular-400.woff2",
  "./fontawesome/webfonts/fa-brands-400.woff2",
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Warm the same offline assets, but in small batches. Parallel requests
    // for every question image at once can overwhelm slower devices.
    for (let i = 0; i < APP_SHELL.length; i += 6) {
      await Promise.all(APP_SHELL.slice(i, i + 6).map(async path => {
        try {
          const request = new Request(new URL(path, self.registration.scope).href, { cache: 'reload' });
          const response = await fetch(request);
          if (response.ok) await cache.put(request, response.clone());
        } catch (_) { /* Requested files cache as they are used. */ }
      }));
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k.startsWith('kotoba-quest-') && k !== CACHE_NAME).map(k => caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response && response.ok && response.type !== 'opaque') {
          try { await cache.put(request, response.clone()); } catch (_) {}
        }
        return response;
      } catch (error) {
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const shell = await cache.match(new URL('index.html', self.registration.scope).href, { ignoreSearch: true });
          if (shell) return shell;
        }
        throw error;
      }
    })());
  }
});
