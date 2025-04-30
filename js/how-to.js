document.addEventListener('DOMContentLoaded', () => {
    const readmeLink = document.getElementById('readme-link');
    const dialog = document.getElementById('alert-dialog');
    const alertText = document.getElementById('alert-text');
    const closeButton = document.getElementById('close');
    const langToggle = document.getElementById('changeLanguage');
  
    // Make alert text selectable
    alertText.classList.add('selectable');
  
    // Open dialog and load content
    readmeLink.addEventListener('click', async (e) => {
      e.preventDefault();
      // Determine active language ('de' or 'en')
      const activeSpan = langToggle.querySelector('.active');
      const lang = activeSpan ? activeSpan.id : 'de';
      const txtPath = `/how-to-${lang}.txt`;
  
      try {
        const response = await fetch(txtPath);
        if (!response.ok) throw new Error(`Fehler beim Laden: ${response.status}`);
        const htmlContent = await response.text();
        alertText.innerHTML = htmlContent;
        // Show the dialog
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      } catch (err) {
        alertText.textContent = `Fehler: ${err.message}`;
        // Show the dialog even on error
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      }
    });
  
    // Close dialog
    closeButton.addEventListener('click', () => {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    });
  });