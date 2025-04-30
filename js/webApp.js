(function() {
  let deferredPrompt = null;

  function init() {
    const dialog     = document.getElementById('dialogWebApp');
    const dismissBtn = document.getElementById('dismissWebApp');
    const addBtn     = document.getElementById('addWebApp');
    const shareBtn   = document.getElementById('shareWebApp');
    if (!dialog) return;

    const COOKIE_NAME = 'dialogWebAppDismissed';
    function setDismissCookie() {
      document.cookie = `${COOKIE_NAME}=true; path=/; max-age=315360000`;
    }
    function isDismissed() {
      return document.cookie.split('; ').some(c => c.startsWith(`${COOKIE_NAME}=`));
    }

    function isStandalone() {
      const ua = navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(ua);
      return (isIos && window.navigator.standalone === true)
          || window.matchMedia('(display-mode: standalone)').matches;
    }
    function isMobileDevice() {
      return /Mobi|Android|iP(hone|od|ad)|Windows Phone|webOS/.test(navigator.userAgent);
    }

    function showDialog() {
      dialog.classList.add('show');
    }
    function hideDialog(store = true) {
      dialog.classList.remove('show');
      if (store) setDismissCookie();
    }

    // Mobile-only and not in PWA
    if (!isMobileDevice()) return;
    if (isStandalone()) {
      document.body.classList.add('web-app');
      return;
    }
    if (!isDismissed()) showDialog();

    // Dismiss on × or click outside content
    dismissBtn.addEventListener('click', () => hideDialog(true));
    dialog.addEventListener('click', e => {
      if (e.target === dialog) hideDialog(true);
    });
    // Also any click outside .dialog-content
    document.addEventListener('click', e => {
      if (dialog.classList.contains('show') && !e.target.closest('#dialogWebApp .dialog-content') && e.target.id !== 'topicSelection') {
        hideDialog(true);
      }
    });

    // Install prompt
    window.addEventListener('beforeinstallprompt', e => {
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

    // Share / Add to Home fallback for iOS
    shareBtn.addEventListener('click', () => {
      const ua = navigator.userAgent.toLowerCase();
      const isiOS = /iphone|ipad|ipod/.test(ua);
      if (navigator.share && !isiOS) {
        navigator.share({ title: document.title, url: window.location.href })
          .catch(err => showAlert(`Teilen fehlgeschlagen: ${err.message}`));
      } else {
        showAlert('Zum Installieren im Teilen-Menü „Zum Home-Bildschirm“ wählen.');
      }
    });
  }

  window.addEventListener('DOMContentLoaded', init);
})();
