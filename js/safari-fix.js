(function() {
  // 1. Repaint-Funktion definieren
  function repaintLegend() {
    const legend = document.querySelector('fieldset legend');
    if (!legend) return;
    // GPU Layer erzwingen und Repaint
    legend.style.transform = 'translateZ(0)';
    // danach wieder entfernen
    requestAnimationFrame(() => {
      legend.style.transform = '';
    });
  }

  // 2. Beim Laden der Seite einmal auslösen
  window.addEventListener('DOMContentLoaded', repaintLegend);

  // 3. classList.remove auf dem startScreen wrappen
  window.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.querySelector('#startScreen');
    if (!startScreen) return;

    const originalRemove = startScreen.classList.remove;
    startScreen.classList.remove = function(...classes) {
      const result = originalRemove.apply(this, classes);
      if (classes.includes('hidden')) {
        // winzige Verzögerung bevor Repaint
        repaintLegend()
      }
      return result;
    };
  });
})();