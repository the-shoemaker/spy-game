// programm.js
window.addEventListener('DOMContentLoaded', () => {
  // Dialog-Referenzen
  const alertDialog = document.getElementById('alert-dialog');
  const alertText = document.getElementById('alert-text');
  const alertClose = document.getElementById('close');

  function showAlert(message) {
    return new Promise(resolve => {
      alertText.textContent = message;
      alertDialog.showModal();
      alertClose.onclick = () => { alertDialog.close(); resolve(); };
    });
  }

  // DOM-Referenzen
  const startScreen = document.getElementById('startScreen');
  const gameScreen = document.getElementById('gameScreen');
  const playerCountInput = document.getElementById('playerCountInput');
  const normalStartButton = document.getElementById('normalStartButton');
  const sessionToggle = document.getElementById('session-toggle');
  const sessionResetButton = document.getElementById('sessionResetButton');
  const topicDisplay = document.getElementById('topicDisplay');
  const playerTurn = document.getElementById('playerTurn');
  const revealBox = document.getElementById('revealBox');
  const actionButton = document.getElementById('actionButton');
  const indicatorText = document.getElementById('indicator-text');
  const indicatorDot = document.getElementById('indicator-dot');

  // Themen-Auswahl DOM
  const topicSelectionBtn = document.getElementById('topicSelection');
  const topicDialog = document.getElementById('topic-selection-wrapper');
  const selectAllBtn = document.getElementById('select-all-topics');
  const closeDialogBtn = document.getElementById('exit-selection');
  const topicListContainer = document.getElementById('topic-selection-scroll');
  const changeLangBtn = document.getElementById('changeLanguage');
  const deSpan = document.getElementById('de');
  const enSpan = document.getElementById('en');

  // Spiel-Status
  let numPlayers = 0, currentPlayer = 1, secretPlayer = 0;
  let chosenCategory = '', chosenItem = '';
  let isSessionMode = false, sessionTopics = {}, sessionRoundPlayed = false;
  let allSpies = false, actionState = 'reveal';

  // Sprache & Themen-State
  let currentLanguage = localStorage.getItem('topicLanguage') || 'DE';
  let topicsData = {};
  let selectedCategories = JSON.parse(localStorage.getItem('selectedTopics') || 'null');

  function saveTopicSelection() {
    localStorage.setItem('selectedTopics', JSON.stringify(selectedCategories));
  }
  function saveLanguage() {
    localStorage.setItem('topicLanguage', currentLanguage);
  }

  function loadTopicsScript() {
    return new Promise(resolve => {
      const old = document.getElementById('topicsScript');
      if (old) old.remove();
      const script = document.createElement('script');
      script.id = 'topicsScript';
      script.src = currentLanguage === 'DE' ? '/js/topics.js' : '/js/topics-en.js';
      script.onload = () => {
        // Nutze window.topics (overwritten by topics.js or topics-en.js)
        topicsData = window.topics || {};
        const allCats = Object.keys(topicsData);
        if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) {
          selectedCategories = allCats.slice();
        } else {
          selectedCategories = selectedCategories.filter(c => allCats.includes(c));
          if (selectedCategories.length === 0) selectedCategories = allCats.slice();
        }
        saveTopicSelection();
        resolve();
      };
      script.onerror = () => {
        console.error('Fehler beim Laden des Topic-Skripts:', script.src);
        topicsData = {};
        selectedCategories = [];
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  // Themen-Dialog Funktionen
  function renderTopicList() {
    topicListContainer.innerHTML = '';
    Object.keys(topicsData).forEach(cat => {
      const label = document.createElement('label'); label.className = 'topic';
      const title = document.createElement('h3'); title.className = 'topic-title'; title.textContent = capitalize(cat);
      const chk = document.createElement('input'); chk.type = 'checkbox'; chk.className = 'topic-checkbox'; chk.checked = selectedCategories.includes(cat);
      chk.addEventListener('change', () => {
        if (chk.checked) selectedCategories.push(cat);
        else selectedCategories = selectedCategories.filter(c => c !== cat);
        saveTopicSelection();
      });
      label.append(title, chk);
      topicListContainer.appendChild(label);
    });
  }
  function openTopicDialog() { renderTopicList(); topicDialog.classList.add('shown'); }
  function closeTopicDialog() { topicDialog.classList.remove('shown'); }
  topicSelectionBtn.addEventListener('click', openTopicDialog);
  selectAllBtn.addEventListener('click', () => { selectedCategories = Object.keys(topicsData); saveTopicSelection(); closeTopicDialog(); });
  closeDialogBtn.addEventListener('click', closeTopicDialog);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && topicDialog.classList.contains('shown')) closeTopicDialog(); });

  // Sprachumschaltung
  changeLangBtn.addEventListener('click', async () => {
    currentLanguage = currentLanguage === 'DE' ? 'EN' : 'DE';
    deSpan.classList.toggle('active', currentLanguage === 'DE');
    enSpan.classList.toggle('active', currentLanguage === 'EN');
    selectedCategories = null;
    localStorage.removeItem('selectedTopics');
    saveLanguage();
    localStorage.setItem('language', currentLanguage.toLowerCase());
    await loadTopicsScript();
    if (topicDialog.classList.contains('shown')) renderTopicList();
  });

  // Spiel-Start und Themenwahl
  normalStartButton.addEventListener('click', async () => {
    numPlayers = parseInt(playerCountInput.value, 10);
    if (!numPlayers || numPlayers < 3) { await showAlert('Es muss mindestens drei Spieler haben'); return; }
    currentPlayer = 1; allSpies = Math.random() < 0.005; secretPlayer = allSpies ? 0 : Math.floor(Math.random() * numPlayers) + 1;
    if (isSessionMode) { sessionRoundPlayed = true; updateSessionButtons(); saveSessionState(); pickNewTopicSession(); }
    else pickNewTopicNormal();
    revealBox.textContent = ''; revealBox.classList.remove('revealed');
    startScreen.classList.add('hidden'); gameScreen.classList.remove('hidden');
    setActionState('reveal'); playerTurn.textContent = `Spieler ${currentPlayer}`;
  });
  function pickNewTopicNormal() {
    const cats = selectedCategories.length ? selectedCategories : Object.keys(topicsData);
    chosenCategory = cats[Math.floor(Math.random() * cats.length)];
    const list = topicsData[chosenCategory] || [];
    chosenItem = list[Math.floor(Math.random() * list.length)] || '';
    topicDisplay.textContent = `Thema: ${capitalize(chosenCategory)}`;
  }
  function pickNewTopicSession() {
    const avail = Object.keys(sessionTopics).filter(c => sessionTopics[c].length);
    if (!avail.length) { showAlert('Keine Themen mehr, Session wird zurückgesetzt').then(() => { resetSession(true); pickNewTopicSession(); }); return; }
    chosenCategory = avail[Math.floor(Math.random() * avail.length)];
    chosenItem = sessionTopics[chosenCategory].splice(Math.floor(Math.random() * sessionTopics[chosenCategory].length), 1)[0];
    saveSessionState(); topicDisplay.textContent = `Thema: ${capitalize(chosenCategory)}`;
  }
  actionButton.addEventListener('click', () => { if (actionState === 'reveal') { revealItem(); setActionState(currentPlayer < numPlayers ? 'next' : 'end'); } else if (actionState === 'next') nextTurn(); else resetGame(); });
  function revealItem() { revealBox.classList.add('revealed'); revealBox.textContent = (allSpies || (currentPlayer === secretPlayer && numPlayers > 1)) ? 'Du bist Spion' : chosenItem; }
  function nextTurn() { revealBox.classList.remove('revealed'); revealBox.textContent = ''; if (currentPlayer < numPlayers) { currentPlayer++; playerTurn.textContent = `Spieler ${currentPlayer}`; setActionState('reveal'); } else resetGame(); }
  function setActionState(s) { actionState = s; actionButton.textContent = s === 'reveal' ? 'Aufdecken' : s === 'next' ? 'Weiter' : 'Beenden'; }
  function resetGame() { gameScreen.classList.add('hidden'); startScreen.classList.remove('hidden'); }

  // Session-Funktionen (Original)
  function saveSessionState() { localStorage.setItem('sessionState', JSON.stringify({ sessionTopics, isSessionMode, sessionRoundPlayed })); }
  function loadSessionState() { const d = localStorage.getItem('sessionState'); if (d) { try { const s = JSON.parse(d); sessionTopics = s.sessionTopics || {}; isSessionMode = s.isSessionMode; sessionRoundPlayed = s.sessionRoundPlayed; } catch {} } }
  function toggleSessionMode() { if (!isSessionMode) { isSessionMode = true; sessionRoundPlayed = false; sessionTopics = Object.fromEntries(Object.entries(window.topics).map(([k,v]) => [k,[...v]])); saveSessionState(); } else { isSessionMode = false; sessionTopics = {}; localStorage.removeItem('sessionState'); } updateSessionIndicator(); updateSessionButtons(); }
  function resetSession(auto = false) { isSessionMode = true; sessionRoundPlayed = auto; sessionTopics = Object.fromEntries(Object.entries(window.topics).map(([k,v]) => [k,[...v]])); saveSessionState(); updateSessionIndicator(); updateSessionButtons(); }
  function updateSessionButtons() { sessionToggle.textContent = isSessionMode ? 'Beenden' : 'Starten'; sessionToggle.classList.toggle('end', isSessionMode); sessionResetButton.disabled = !(isSessionMode && sessionRoundPlayed); }
  function updateSessionIndicator() { indicatorText.textContent = isSessionMode ? 'an' : 'aus'; indicatorDot.classList.toggle('on', isSessionMode); }
  sessionToggle.addEventListener('click', toggleSessionMode);
  sessionResetButton.addEventListener('click', () => resetSession(false));

  function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

  // Initialisierung
  (async () => {
    deSpan.classList.toggle('active', currentLanguage === 'DE');
    enSpan.classList.toggle('active', currentLanguage === 'EN');
    await loadTopicsScript();
    loadSessionState(); updateSessionIndicator(); updateSessionButtons();
  })();
});
