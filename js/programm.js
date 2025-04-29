// programm.js

// Warten, bis DOM geladen ist
window.addEventListener('DOMContentLoaded', () => {
    /***** DOM-Referenzen *****/
    const startScreen        = document.getElementById('startScreen');
    const gameScreen         = document.getElementById('gameScreen');
    const playerCountInput   = document.getElementById('playerCountInput');
  
    const normalStartButton  = document.getElementById('normalStartButton');
    const sessionStartButton = document.getElementById('sessionStartButton');
    const sessionResetButton = document.getElementById('sessionResetButton');
    const sessionEndButton   = document.getElementById('sessionEndButton');
  
    const topicDisplay       = document.getElementById('topicDisplay');
    const playerTurn         = document.getElementById('playerTurn');
    const revealBox          = document.getElementById('revealBox');
    const actionButton       = document.getElementById('actionButton');
  
    const indicatorText      = document.getElementById('indicator-text');
    const indicatorDot       = document.getElementById('indicator-dot');
  
    /***** Spiel-Status *****/
    let numPlayers     = 0;
    let currentPlayer  = 1;
    let secretPlayer   = 0;
    let chosenCategory = '';
    let chosenItem     = '';
  
    let isSessionMode  = false;
    let sessionTopics  = {};
  
    let allSpies       = false;
    let actionState    = 'reveal'; // 'reveal' | 'next' | 'end'
  
    /***** Event-Listener *****/
    normalStartButton.addEventListener('click', startGame);
    sessionStartButton.addEventListener('click', activateSessionMode);
    sessionResetButton.addEventListener('click', resetSession);
    sessionEndButton.addEventListener('click', endSession);
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
  
      // 2) Skript-Pfad von topics.js holen
      const topicScript = document.querySelector('script[data-topic-script="true"]');
      const topicsPath = topicScript ? topicScript.getAttribute('src') : null;
      console.log('Verwendeter topics.js-Pfad:', topicsPath);
      // (Falls Du topics per fetch/import laden willst, kannst Du hier fetch(topicsPath) o.ä. aufrufen.)
  
      currentPlayer = 1;
      allSpies = Math.random() < 0.005;
      secretPlayer = allSpies
        ? 0
        : (numPlayers > 1 ? Math.floor(Math.random() * numPlayers) + 1 : 1);
  
      // 1) Thema nur einmal pro Runde wählen
      if (isSessionMode) pickNewTopicSession();
      else               pickNewTopicNormal();
  
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
        alert('Keine Themen mehr, Session wird zurückgesetzt');
        resetSession();
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
        // 1) kein neues Thema hier – bleibt für alle gleich
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
    function activateSessionMode() {
      isSessionMode = true;
      sessionTopics = Object.fromEntries(
        Object.entries(topics).map(([k,v]) => [k, [...v]])
      );
      saveSessionTopics();
      updateSessionIndicator();
      updateSessionButtons();
    }
  
    function resetSession() {
      isSessionMode = true;
      sessionTopics = Object.fromEntries(
        Object.entries(topics).map(([k,v]) => [k, [...v]])
      );
      saveSessionTopics();
      updateSessionIndicator();
      updateSessionButtons();
      alert('Session wurde zurückgesetzt');
    }
  
    function endSession() {
      isSessionMode = false;
      sessionTopics = {};
      localStorage.removeItem('sessionTopics');
      updateSessionIndicator();
      updateSessionButtons();
    }
  
    function updateSessionButtons() {
      sessionStartButton.disabled  = isSessionMode;
      sessionResetButton.disabled  = !isSessionMode;
      sessionEndButton.disabled    = !isSessionMode;
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
        } catch {}
      }
    }
});