(function() {
    document.addEventListener('DOMContentLoaded', () => {
      const btn    = document.getElementById('changeLanguage');
      const spanDe = document.getElementById('de');
      const spanEn = document.getElementById('en');
  
      // Wörterbuch Deutsch → Englisch
      const dictionary = {
        "Installieren Sie unsere Web-App für eine bessere Erfahrung!": "Install our web app for a better experience!",
        "Es muss mindestens drei Spieler haben": "At least three players are needed",
        "Keine Themen mehr, Sitzung wird zurückgesetzt": "Out of topics, resetting session",
        "Spiel Starten": "Start Game",
        "Du bist Spion": "You are the Spy",
        "Sitzungsmodus": "Session-Mode",
        "Sitzungseinstellungen": "Session Settings",
        "Anzahl der Spieler": "Number of Players",
        "Aufdecken": "Reveal",
        "Spion Spiel": "Spy Game",
        "Die Teilen-API wird von diesem Browser nicht unterstützt": "Share API not supported on this browser",
        "App Installieren": "Install App",
        "Teilen zur Startseite (iOS)": "Share / Add to Home (iOS)",
        "Spion": "Spy",
        "Themenauswahl": "Topic Selection",
        "Alle Themen": "Alle Topics",
        "Load Failed": "Lade Fehler",
        "Fehler": "Error",
        "Impressum": "Imprint",
        "Weiter": "Next",
        "Thema": "Topic",
        "Starten": "Start",
        "Zurücksetzen": "Reset",
        "Beenden": "End",
        "Spieler": "Player",
        "Schliessen": "Close",
        "aus": "off",
        "an": "on",
      };
  
      let language = localStorage.getItem('language') || 'de';
  
      // --- Title speichern ---
      const originalTitle = document.title;
  
      // --- Manifest laden und vorbereiten ---
      const manifestLink = document.querySelector('link[rel="manifest"]');
      let originalManifest = null;
  
      fetch(manifestLink.href)
        .then(res => res.json())
        .then(json => {
          originalManifest = json;
          updateManifest(); // auf initiale Sprache anwenden
        })
        .catch(() => {
          console.warn('Manifest konnte nicht geladen werden.');
        });
  
      function escapeRegExp(str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      }
      function invertDict(dict) {
        return Object.fromEntries(Object.entries(dict).map(([k,v]) => [v,k]));
      }
      function translateString(text) {
        if (!text) return text;
        const dict = language === 'en' ? dictionary : invertDict(dictionary);
        return Object.entries(dict).reduce((acc, [src,tgt]) => {
          const re = new RegExp(`\\b${escapeRegExp(src)}\\b`, 'g');
          return acc.replace(re, tgt);
        }, text);
      }
  
      function translatePage() {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
          node.nodeValue = translateString(node.nodeValue);
        }
      }
      function translatePlaceholders() {
        document.querySelectorAll('[placeholder]').forEach(el => {
          el.setAttribute('placeholder', translateString(el.getAttribute('placeholder')));
        });
      }
      function switchTopicsScript() {
        const existing = document.querySelector('script[data-topic-script]');
        if (existing) existing.remove();
        const newScript = document.createElement('script');
        newScript.setAttribute('data-topic-script', 'true');
        newScript.src = language === 'en' ? '/js/topics-en.js' : '/js/topics.js';
        document.body.appendChild(newScript);
      }
  
      // --- Neuer Helper: Manifest updaten ---
      function updateManifest() {
        if (!originalManifest) return;
        const m = { ...originalManifest };
        m.name       = translateString(originalManifest.name);
        m.short_name = translateString(originalManifest.short_name);
        const blob = new Blob([JSON.stringify(m)], { type: 'application/manifest+json' });
        const url  = URL.createObjectURL(blob);
        manifestLink.href = url;
      }
  
      function setLanguage(lang) {
        language = lang;
        localStorage.setItem('language', lang);
        spanDe.classList.toggle('active', lang === 'de');
        spanEn.classList.toggle('active', lang === 'en');
  
        // **Titel übersetzen**
        document.title = translateString(originalTitle);
  
        translatePage();
        translatePlaceholders();
        switchTopicsScript();
        updateManifest();  // **Manifest-Update**
      }
  
      const observer = new MutationObserver(() => {
        translatePage();
        translatePlaceholders();
      });
      observer.observe(document.body, { childList: true, subtree: true });
  
      if (btn) {
        btn.addEventListener('click', () => setLanguage(language === 'de' ? 'en' : 'de'));
      }
  
      // Initial auf gespeicherte Sprache setzen
      setLanguage(language);
    });
  })();