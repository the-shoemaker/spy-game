// langSwitcher.js

// Wörterbuch Deutsch → Englisch (hier weitere Einträge ergänzen)
const dictionary = {
    "Session wurde zurückgesetzt": "Session was reset",
    "Es muss mindestens drei Spieler haben": "At least three players are needed",
    "Keine Themen mehr, Session wird zurückgesetzt": "Out of topics, resetting session",
    "Spiel Starten": "Start Game",
    "Du bist Spion": "You are the Spy",
    "Session-Modus": "Session-Mode",
    "Session Einstellungen": "Session Settings",
    "Anzahl der Spieler": "Number of Players",
    "Aufdecken": "Reveal",
    "Spion": "Spy",
    "Weiter": "Next",
    "Thema": "Topic",
    "Starten": "Start",
    "Zurücksetzen": "Reset",
    "Beenden": "End",
    "Spieler": "Player",
    "aus": "off",
    "an": "on"
};

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const btn    = document.getElementById('changeLanguage');
        const spanDe = document.getElementById('de');
        const spanEn = document.getElementById('en');

        // Aktuelle Sprache aus localStorage oder Default
        let language = localStorage.getItem('language') || 'de';

        // Übersetze alert-Meldungen
        const originalAlert = window.alert;
        window.alert = msg => originalAlert(translateString(String(msg)));

        function escapeRegExp(str) {
            return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
        function invertDict(dict) {
            return Object.fromEntries(Object.entries(dict).map(([k,v]) => [v,k]));
        }
        function translateString(text) {
            if (!text) return text;
            const dict = language === 'en' ? dictionary : invertDict(dictionary);
            let result = text;
            for (const [src, tgt] of Object.entries(dict)) {
                const pattern = new RegExp(`\\b${escapeRegExp(src)}\\b`, 'g');
                result = result.replace(pattern, tgt);
            }
            return result;
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

        // Script-Tag für Topics tauschen, nur beim Sprachwechsel
        function switchTopicsScript() {
            const existing = document.querySelector('script[data-topic-script]');
            if (existing) existing.remove();
            const newScript = document.createElement('script');
            newScript.setAttribute('data-topic-script', 'true');
            newScript.src = language === 'en' ? '/js/topics-en.js' : '/js/topics.js';
            document.body.appendChild(newScript);
        }

        function setLanguage(lang) {
            language = lang;
            localStorage.setItem('language', lang);
            spanDe.classList.toggle('active', lang === 'de');
            spanEn.classList.toggle('active', lang === 'en');
            translatePage();
            translatePlaceholders();
            switchTopicsScript();
        }

        // Beobachte nur Seite und Platzhalter, nicht Script-Tags
        const observer = new MutationObserver(() => {
            translatePage();
            translatePlaceholders();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        if (btn) btn.addEventListener('click', () => setLanguage(language === 'de' ? 'en' : 'de'));

        // Initial
        setLanguage(language);
    });
})();
