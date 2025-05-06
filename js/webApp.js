// script.js
(function() {
  let deferredPrompt = null;

  function init() {
    const dialog     = document.getElementById('dialogWebApp');
    const dismissBtn = document.getElementById('dismissWebApp');
    const addBtn     = document.getElementById('addWebApp');
    // shareBtn no longer used/queried

    if (!dialog) return;

    // detect platforms once
    const ua        = navigator.userAgent.toLowerCase();
    const isIos     = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    // always hide the install button by default…
    addBtn.style.display = 'none';
    // …and show the little “iOS hint” only on iOS
    const iosText = dialog.querySelector('.ios-text');
    if (iosText) iosText.style.display = isIos ? 'block' : 'none';

    const COOKIE_NAME = 'dialogWebAppDismissed';
    function setDismissCookie() {
      document.cookie = `${COOKIE_NAME}=true; path=/; max-age=315360000`;
    }
    function isDismissed() {
      return document.cookie.split('; ').some(c => c.startsWith(`${COOKIE_NAME}=`));
    }

    function isStandalone() {
      return (isIos && window.navigator.standalone === true)
          || window.matchMedia('(display-mode: standalone)').matches;
    }
    function isMobileDevice() {
      return /Mobi|Android|iP(hone|od|ad)|Windows Phone|webOS/.test(ua);
    }

    function showDialog() {
      dialog.classList.add('show');
    }
    function hideDialog(store = true) {
      dialog.classList.remove('show');
      if (store) setDismissCookie();
    }

    // only mobile, not PWA
    if (!isMobileDevice()) return;
    if (isStandalone()) {
      document.body.classList.add('web-app');
      return;
    }
    if (!isDismissed()) showDialog();

    // always allow closing
    dismissBtn.addEventListener('click', () => hideDialog(true));
    dialog.addEventListener('click', e => {
      if (e.target === dialog) hideDialog(true);
    });
    document.addEventListener('click', e => {
      if (dialog.classList.contains('show')
          && !e.target.closest('#dialogWebApp .dialog-content')
          && e.target.id !== 'topicSelection') {
        hideDialog(true);
      }
    });

    // Install prompt: only on Android
    window.addEventListener('beforeinstallprompt', e => {
      if (!isAndroid) return;
      e.preventDefault();
      deferredPrompt = e;
      addBtn.style.display = 'inline-block';
    });
    addBtn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        showAlert('Installation derzeit nicht verfügbar');
        return;
      }
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome !== 'accepted') throw new Error('Installation abgelehnt');
      } catch (err) {
        showAlert(`Installationsfehler: ${err.message}`);
      } finally {
        deferredPrompt = null;
        hideDialog(false);
      }
    });
  }

  window.addEventListener('DOMContentLoaded', init);
})();