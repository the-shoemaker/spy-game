// Warten, bis DOM geladen ist
window.addEventListener('DOMContentLoaded', () => {
  /***** DOM-Referenzen *****/
  const startScreen        = document.getElementById('startScreen');
  const gameScreen         = document.getElementById('gameScreen');
  const playerCountInput   = document.getElementById('playerCountInput');

  const normalStartButton  = document.getElementById('normalStartButton');
  const sessionToggle      = document.getElementById('session-toggle');
  const sessionResetButton = document.getElementById('sessionResetButton');

  const topicDisplay       = document.getElementById('topicDisplay');
  const playerTurn         = document.getElementById('playerTurn');
  const revealBox          = document.getElementById('revealBox');
  const actionButton       = document.getElementById('actionButton');

  const indicatorText      = document.getElementById('indicator-text');
  const indicatorDot       = document.getElementById('indicator-dot');

  /***** Spiel-Status *****/
  let numPlayers          = 0;
  let currentPlayer       = 1;
  let secretPlayer        = 0;
  let chosenCategory      = '';
  let chosenItem          = '';

  let isSessionMode       = false;
  let sessionTopics       = {};
  let sessionRoundPlayed  = false; // Flag, ob mindestens eine Runde lief

  let allSpies            = false;
  let actionState         = 'reveal'; // 'reveal' | 'next' | 'end'

  /***** Event-Listener *****/
  normalStartButton.addEventListener('click', startGame);
  sessionToggle.addEventListener('click', toggleSessionMode);
  sessionResetButton.addEventListener('click', () => resetSession(false));
  actionButton.addEventListener('click', handleAction);

  // Session-UI initialisieren
  loadSessionTopics();
  updateSessionIndicator();
  updateSessionButtons();

  /***** Spiellogik *****/
  function startGame() {
    numPlayers = parseInt(playerCountInput.value, 10);
    if (!numPlayers || numPlayers < 3) {
      alert('Es muss mindestens drei Spieler haben');
      return;
    }

    const topicScript = document.querySelector('script[data-topic-script="true"]');
    const topicsPath = topicScript ? topicScript.getAttribute('src') : null;
    console.log('Verwendeter topics.js-Pfad:', topicsPath);

    currentPlayer = 1;
    allSpies = Math.random() < 0.005;
    secretPlayer = allSpies
      ? 0
      : (numPlayers > 1 ? Math.floor(Math.random() * numPlayers) + 1 : 1);

    if (isSessionMode) {
      sessionRoundPlayed = true;
      updateSessionButtons();
      pickNewTopicSession();
    } else {
      pickNewTopicNormal();
    }

    revealBox.textContent = '';
    revealBox.classList.remove('revealed');

    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    setActionState('reveal');
    playerTurn.textContent = `Spieler ${currentPlayer}`;
  }

  function pickNewTopicNormal() {
    const cats = Object.keys(topics);
    chosenCategory = cats[Math.floor(Math.random() * cats.length)];
    const items = topics[chosenCategory];
    chosenItem = items[Math.floor(Math.random() * items.length)];
    topicDisplay.textContent = `Thema: ${capitalize(chosenCategory)}`;
  }

  function pickNewTopicSession() {
    const available = Object.keys(sessionTopics).filter(cat => sessionTopics[cat].length);
    if (!available.length) {
      resetSession(true); // Automatischer Reset mit Alert
      // Nach automatischem Reset soll Reset-Button aktiv bleiben
      sessionRoundPlayed = true;
      updateSessionButtons();
      return pickNewTopicSession();
    }
    chosenCategory = available[Math.floor(Math.random() * available.length)];
    chosenItem = sessionTopics[chosenCategory].splice(
      Math.floor(Math.random() * sessionTopics[chosenCategory].length),
      1
    )[0];
    saveSessionTopics();
    topicDisplay.textContent = `Thema: ${capitalize(chosenCategory)}`;
  }

  function revealItem() {
    revealBox.classList.add('revealed');
    revealBox.textContent = (allSpies || (currentPlayer === secretPlayer && numPlayers > 1))
      ? 'Du bist Spion'
      : chosenItem;
  }

  function nextTurn() {
    revealBox.classList.remove('revealed');
    revealBox.textContent = '';

    if (currentPlayer < numPlayers) {
      currentPlayer++;
      playerTurn.textContent = `Spieler ${currentPlayer}`;
      setActionState('reveal');
    } else {
      resetGame();
    }
  }

  function handleAction() {
    if (actionState === 'reveal') {
      revealItem();
      setActionState(currentPlayer < numPlayers ? 'next' : 'end');
    } else if (actionState === 'next') {
      nextTurn();
    } else {
      resetGame();
    }
  }

  function setActionState(state) {
    actionState = state;
    actionButton.textContent = state === 'reveal'
      ? 'Aufdecken'
      : state === 'next'
        ? 'Weiter'
        : 'Beenden';
  }

  function resetGame() {
    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /***** Session-Funktionen *****/
  function toggleSessionMode() {
    if (!isSessionMode) {
      isSessionMode = true;
      sessionRoundPlayed = false;
      sessionTopics = Object.fromEntries(
        Object.entries(topics).map(([k,v]) => [k, [...v]])
      );
      saveSessionTopics();
    } else {
      isSessionMode = false;
      sessionRoundPlayed = false;
      sessionTopics = {};
      localStorage.removeItem('sessionTopics');
    }
    updateSessionIndicator();
    updateSessionButtons();
  }

  function resetSession(auto = false) {
    isSessionMode = true;
    // Beim manuellen Reset Flag zurücksetzen, beim automatischen beibehalten
    sessionRoundPlayed = auto ? true : false;
    sessionTopics = Object.fromEntries(
      Object.entries(topics).map(([k,v]) => [k, [...v]])
    );
    saveSessionTopics();
    updateSessionIndicator();
    updateSessionButtons();
    if (auto) alert('Keine Themen mehr, Session wird zurückgesetzt');
  }

  function updateSessionButtons() {
    sessionToggle.textContent = isSessionMode ? 'Beenden' : 'Starten';
    sessionToggle.classList.toggle('end', isSessionMode);
    sessionResetButton.disabled = !(isSessionMode && sessionRoundPlayed);
  }

  function updateSessionIndicator() {
    indicatorText.textContent = isSessionMode ? 'an' : 'aus';
    indicatorDot.classList.toggle('on', isSessionMode);
  }

  /***** LocalStorage *****/
  function saveSessionTopics() {
    localStorage.setItem('sessionTopics', JSON.stringify(sessionTopics));
  }

  function loadSessionTopics() {
    const data = localStorage.getItem('sessionTopics');
    if (data) {
      try {
        sessionTopics = JSON.parse(data);
        isSessionMode = true;
        sessionRoundPlayed = false; // Nach Neuladen keine Runde gespielt
      } catch {}
    }
  }
});
