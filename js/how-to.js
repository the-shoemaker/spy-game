// how-to.js
document.addEventListener('DOMContentLoaded', () => {
  const readmeLink   = document.getElementById('readme-link');
  const dialog       = document.getElementById('alert-dialog');
  const alertText    = document.getElementById('alert-text');
  const closeButton  = document.getElementById('close');
  const langToggle   = document.getElementById('changeLanguage');

  // Damit man den Text markieren kann
  alertText.classList.add('selectable');

  readmeLink.addEventListener('click', async (e) => {
    e.preventDefault();

    // Aktive Sprache ermitteln
    const activeSpan = langToggle.querySelector('.active');
    const lang = activeSpan ? activeSpan.id : 'de';

    // Relativer Pfad
    const txtPath = `how-to-${lang}.txt`;
    console.log('[how-to] Lade:', txtPath);

    try {
      const response = await fetch(txtPath);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const textContent = await response.text();

      // Zeilenumbrüche erhalten
      alertText.innerHTML = `<pre>${textContent}</pre>`;

      // Dialog öffnen
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    } catch (err) {
      console.error('[how-to] Fetch-Fehler:', err);
      alertText.textContent = `Fehler: ${err.message}`;
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    }
  });

  // Dialog schliessen
  closeButton.addEventListener('click', () => {
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  });
});