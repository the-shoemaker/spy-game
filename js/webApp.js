(function() {
  let deferredPrompt = null;

  // 1) Wir holen uns die DOM-Elemente erst, wenn sie da sind
  function init() {
    const dialog     = document.getElementById('dialogWebApp');     // <-- ID korrigiert
    const dismissBtn = document.getElementById('dismissWebApp');
    const addBtn     = document.getElementById('addWebApp');
    const shareBtn   = document.getElementById('shareWebApp');

    // Falls der Dialog nicht existiert, nichts tun
    if (!dialog) return;

    const COOKIE_NAME = 'dialogWebAppDismissed';

    // Cookie-Helper
    function setDismissCookie() {
      document.cookie = `${COOKIE_NAME}=true; path=/; max-age=315360000`;
    }
    function isDismissed() {
      return document.cookie.split('; ').some(c => c.startsWith(`${COOKIE_NAME}=`));
    }

    // PWA-Erkennung
    function isStandalone() {
      const ua = navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(ua);
      return (isIos && window.navigator.standalone === true)
          || window.matchMedia('(display-mode: standalone)').matches;
    }
    function isMobileDevice() {
      return /Mobi|Android|iP(hone|od|ad)|Windows Phone|webOS/.test(navigator.userAgent);
    }

    // Dialog zeigen/verstecken
    function showDialog() {
      dialog.classList.add('show');
    }
    function hideDialog(store = true) {
      dialog.classList.remove('show');
      if (store) setDismissCookie();
    }

    // Initial: nur auf Mobile, ausserhalb PWA und nicht wenn bereits dismissed
    if (!isMobileDevice() || isStandalone() || isDismissed()) return;
    showDialog();

    // ■ Events
    // Schliessen-Button
    dismissBtn.addEventListener('click', () => hideDialog(true));
    // Klick ausserhalb (Overlay)
    dialog.addEventListener('click', e => {
      if (e.target === dialog) hideDialog(true);
    });
    // Install-Prompt (Chrome/Android)
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
      addBtn.style.display = 'inline-block';
    });
    addBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      hideDialog(false);
    });
    // Share-Button
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: document.title, url: window.location.href });
        } catch (err) { console.warn('Sharing failed:', err); }
      } else {
        // wenn du hier einen Alert willst, nutze showAlert aus programm.js
        alert('Teilen nicht unterstützt');
      }
    });
  }

  // Init erst, wenn DOM bereit
  window.addEventListener('DOMContentLoaded', init);
})();