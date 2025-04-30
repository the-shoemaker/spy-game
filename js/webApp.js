(function() {
  let deferredPrompt = null;
  const dialog     = document.getElementById('dialogWebApP');
  const dismissBtn = document.getElementById('dismissWebApp');
  const addBtn     = document.getElementById('addWebApp');
  const shareBtn   = document.getElementById('shareWebApp');
  const COOKIE_NAME = 'dialogWebAppDismissed';

  // Cookie helpers
  function setDismissCookie() {
    // 10 years
    document.cookie = `${COOKIE_NAME}=true; path=/; max-age=315360000`;
  }
  function isDismissed() {
    return document.cookie
      .split('; ')
      .some(c => c.startsWith(`${COOKIE_NAME}=`));
  }

  // 1. Improved PWA detection (incl. iOS)
  function isStandalone() {
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    // iOS Safari standalone flag OR standard display-mode
    return (isIos && window.navigator.standalone === true)
        || window.matchMedia('(display-mode: standalone)').matches;
  }

  // 2. Mobile-only
  function isMobileDevice() {
    return /Mobi|Android|iP(hone|od|ad)|Windows Phone|webOS/.test(navigator.userAgent);
  }

  // 3. Show / hide
  function showDialog() {
    dialog.classList.add('show');
  }
  function hideDialog(store = true) {
    dialog.classList.remove('show');
    if (store) setDismissCookie();
  }

  // 4. Init on load
  function init() {
    if (!isMobileDevice()) return;       // only mobile
    if (isStandalone()) {
      document.body.classList.add('web-app');
      return;                           // don’t show inside PWA
    }
    if (!isDismissed()) showDialog();    // show if cookie not set
  }

  // 5. Catch Chrome/Android install prompt
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    addBtn.style.display = 'inline-block';
  });

  // 6. Wire up events
  window.addEventListener('DOMContentLoaded', init);

  // dismiss on × or outside
  dismissBtn.addEventListener('click', () => hideDialog(true));
  dialog.addEventListener('click', e => {
    if (e.target === dialog) hideDialog(true);
  });

  // install on Android/Chrome
  addBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    hideDialog(false);
  });

  // share sheet (iOS/web fallback)
  shareBtn.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url:   window.location.href
        });
      } catch (err) {
        console.warn('Sharing failed:', err);
      }
    } else {
      showAlert('Die Teilen-API wird von diesem Browser nicht unterstützt');
    }
  });
})();