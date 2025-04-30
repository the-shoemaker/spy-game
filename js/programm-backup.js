// programm.js
window.addEventListener('DOMContentLoaded', () => {
    // Dialog-Referenzen
    const alertDialog = document.getElementById('alert-dialog');
    const alertText   = document.getElementById('alert-text');
    const alertClose  = document.getElementById('close');
  
    // Modal-Alert-Funktion
    function showAlert(message) {
      return new Promise(resolve => {
        alertText.textContent = message;
        alertDialog.showModal();
        alertClose.onclick = () => {
          alertDialog.close();
          resolve();
        };
      });
    }
  
    // DOM-Referenzen
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
  
    // Spiel-Status
    let numPlayers = 0, currentPlayer = 1, secretPlayer = 0;
    let chosenCategory = '', chosenItem = '';
    let isSessionMode = false, sessionTopics = {}, sessionRoundPlayed = false;
    let allSpies = false, actionState = 'reveal';
  
    // localStorage helpers für Session-State
    function saveSessionState() {
      const state = {
        sessionTopics,
        isSessionMode,
        sessionRoundPlayed
      };
      localStorage.setItem('sessionState', JSON.stringify(state));
    }
    function loadSessionState() {
      const data = localStorage.getItem('sessionState');
      if (data) {
        try {
          const state = JSON.parse(data);
          sessionTopics     = state.sessionTopics     || {};
          isSessionMode     = state.isSessionMode     || false;
          sessionRoundPlayed= state.sessionRoundPlayed|| false;
        } catch {}
      }
    }
  
    // Event-Listener
    normalStartButton.addEventListener('click', startGame);
    sessionToggle.addEventListener('click', toggleSessionMode);
    sessionResetButton.addEventListener('click', () => resetSession(false));
    actionButton.addEventListener('click', handleAction);
  
    // initial Session-State laden
    loadSessionState();
    updateSessionIndicator();
    updateSessionButtons();
  
    // Spiel starten
    async function startGame() {
      numPlayers = parseInt(playerCountInput.value, 10);
      if (!numPlayers || numPlayers < 3) {
        await showAlert('Es muss mindestens drei Spieler haben');
        return;
      }
  
      currentPlayer = 1;
      allSpies = Math.random() < 0.005;
      secretPlayer = allSpies ? 0 : (Math.floor(Math.random() * numPlayers) + 1);
  
      if (isSessionMode) {
        sessionRoundPlayed = true;
        updateSessionButtons();
        saveSessionState();
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
      chosenItem = topics[chosenCategory][
        Math.floor(Math.random() * topics[chosenCategory].length)
      ];
      topicDisplay.textContent = `Thema: ${capitalize(chosenCategory)}`;
    }
  
    function pickNewTopicSession() {
      const available = Object.keys(sessionTopics).filter(cat => sessionTopics[cat].length);
      if (!available.length) {
        // Auto-Reset nach Dialog-Schliessen
        showAlert('Keine Themen mehr, Session wird zurückgesetzt').then(() => {
          resetSession(true);
          pickNewTopicSession();
        });
        return;
      }
      chosenCategory = available[Math.floor(Math.random() * available.length)];
      chosenItem = sessionTopics[chosenCategory].splice(
        Math.floor(Math.random() * sessionTopics[chosenCategory].length),
        1
      )[0];
      saveSessionState();
      topicDisplay.textContent = `Thema: ${capitalize(chosenCategory)}`;
    }
  
    function revealItem() {
      revealBox.classList.add('revealed');
      revealBox.textContent = (
        allSpies ||
        (currentPlayer === secretPlayer && numPlayers > 1)
      ) ? 'Du bist Spion' : chosenItem;
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
      actionButton.textContent = (
        state === 'reveal' ? 'Aufdecken' :
        state === 'next'   ? 'Weiter'   :
                             'Beenden'
      );
    }
  
    function resetGame() {
      gameScreen.classList.add('hidden');
      startScreen.classList.remove('hidden');
    }
  
    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    // Session-Funktionen
    function toggleSessionMode() {
      if (!isSessionMode) {
        isSessionMode      = true;
        sessionRoundPlayed = false;
        sessionTopics      = Object.fromEntries(
          Object.entries(topics).map(([k,v]) => [k, [...v]])
        );
        saveSessionState();
      } else {
        isSessionMode      = false;
        sessionRoundPlayed = false;
        sessionTopics      = {};
        localStorage.removeItem('sessionState');
      }
      updateSessionIndicator();
      updateSessionButtons();
    }
  
    function resetSession(auto = false) {
      isSessionMode      = true;
      sessionRoundPlayed = auto ? true : false;
      sessionTopics      = Object.fromEntries(
        Object.entries(topics).map(([k,v]) => [k, [...v]])
      );
      saveSessionState();
      updateSessionIndicator();
      updateSessionButtons();
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
  });
  
  //SAVE