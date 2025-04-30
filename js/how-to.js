// how-to.js
// Lädt die How-To-Texte für DE/EN und zeigt sie in einem Dialog

document.addEventListener('DOMContentLoaded', () => {
  const readmeLink  = document.getElementById('readme-link');
  const dialog      = document.getElementById('alert-dialog');
  const alertText   = document.getElementById('alert-text');
  const closeButton = document.getElementById('close');
  const langToggle  = document.getElementById('changeLanguage');

  alertText.classList.add('selectable'); // Text markierbar machen

  readmeLink.addEventListener('click', async e => {
    e.preventDefault();
    const activeSpan = langToggle.querySelector('.active');
    const lang = activeSpan ? activeSpan.id : 'de';
    // Absoluter Pfad, damit es auf dem Server funktioniert
    const txtPath = `/how-to-${lang}.txt`;
    console.log('[how-to] Lade', txtPath);

    try {
      const response = await fetch(txtPath, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const textContent = await response.text();
      alertText.innerHTML = textContent;
      if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
    } catch (err) {
      console.error('[how-to] Fehler beim Laden', err);
      alertText.textContent = `Fehler beim Laden: ${err.message}`;
      if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
    }
  });

  closeButton.addEventListener('click', () => {
    if (dialog.close) dialog.close(); else dialog.removeAttribute('open');
  });
});
