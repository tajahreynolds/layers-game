/* ============================================================
   Layers — game logic
   No framework, no backend. State lives in memory + localStorage.
   ============================================================ */

(function () {
  "use strict";

  const LEVEL_ORDER = ["surface", "subsurface", "core"];
  const CARDS_TO_UNLOCK = 4; // min cards in a level before "Go deeper" enables
  const WILDCARD_EVERY = 5; // roughly one wildcard per N draws
  const STORE_KEY = "layers.v1";

  // ---- state ----
  const state = {
    names: ["You", "Your partner"],
    theme: "dark",
    levelIndex: 0,
    turn: 0, // 0 -> names[0] answers, 1 -> names[1]
    drawnInLevel: 0,
    totalDrawn: 0,
    sinceWildcard: 0,
    bags: {}, // levelId -> shuffled queue of card strings
    wildcardBag: [], // shuffled wildcards, each shown at most once per game
    saved: [],
    currentText: "",
  };

  // ---- element cache ----
  const $ = (sel) => document.querySelector(sel);
  const el = {
    screens: {
      setup: $("#setup"),
      game: $("#game"),
      reflection: $("#reflection"),
    },
    nameA: $("#name-a"),
    nameB: $("#name-b"),
    beginBtn: $("#begin-btn"),

    levelName: $("#level-name"),
    levelTagline: $("#level-tagline"),
    dots: document.querySelectorAll(".dot"),
    card: $("#card"),
    cardText: $("#card-text"),
    turnIndicator: $("#turn-indicator"),

    drawBtn: $("#draw-btn"),
    skipBtn: $("#skip-btn"),
    saveBtn: $("#save-btn"),
    deepenBtn: $("#deepen-btn"),
    endBtn: $("#end-btn"),

    transition: $("#transition"),
    transitionName: $("#transition-name"),
    transitionBlurb: $("#transition-blurb"),
    transitionBtn: $("#transition-btn"),

    wildcard: $("#wildcard"),
    wildcardTitle: $("#wildcard-title"),
    wildcardBody: $("#wildcard-body"),
    wildcardBtn: $("#wildcard-btn"),
    wildcardTimerBtn: $("#wildcard-timer-btn"),
    timerWrap: $("#timer-wrap"),
    timerDisplay: $("#timer-display"),

    reflectionStat: $("#reflection-stat"),
    savedList: $("#saved-list"),
    closingLine: $("#closing-line"),
    restartBtn: $("#restart-btn"),

    themeBtn: $("#theme-btn"),
  };

  // ---- helpers ----
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Build a fresh, shuffled bag for a level: curated cards + a couple of
  // generated ones so the deck never feels finite.
  function buildBag(levelId) {
    const curated = LEVELS[levelId].cards.slice();
    const generated = generateFromTemplates(levelId, 4);
    return shuffle(curated.concat(generated));
  }

  function generateFromTemplates(levelId, count) {
    const templates = TEMPLATES[levelId] || [];
    if (!templates.length) return [];
    const out = new Set();
    let guard = 0;
    while (out.size < count && guard < count * 8) {
      const t = pick(templates);
      out.add(t.base.replace("{a}", pick(t.a)));
      guard++;
    }
    return Array.from(out);
  }

  function currentLevel() {
    return LEVELS[LEVEL_ORDER[state.levelIndex]];
  }

  function persist() {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ names: state.names, theme: state.theme })
      );
    } catch (e) {
      /* storage may be unavailable; non-fatal */
    }
  }

  function restorePrefs() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.names)) state.names = data.names;
      if (data.theme) state.theme = data.theme;
    } catch (e) {
      /* ignore */
    }
  }

  function showScreen(name) {
    Object.values(el.screens).forEach((s) => s.classList.remove("is-active"));
    el.screens[name].classList.add("is-active");
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
  }

  // ---- level UI ----
  function renderLevelMeta() {
    const lvl = currentLevel();
    el.levelName.textContent = lvl.name;
    el.levelTagline.textContent = lvl.tagline;
    el.dots.forEach((dot, i) => {
      dot.classList.toggle("current", i === state.levelIndex);
      dot.classList.toggle("done", i < state.levelIndex);
    });
  }

  function updateDeepenBtn() {
    const atLast = state.levelIndex >= LEVEL_ORDER.length - 1;
    const ready = state.drawnInLevel >= CARDS_TO_UNLOCK;
    el.deepenBtn.disabled = atLast || !ready;
    el.deepenBtn.style.display = atLast ? "none" : "";
  }

  // ---- core draw loop ----
  function draw() {
    state.sinceWildcard++;
    state.totalDrawn++;

    // Inject a wildcard occasionally (never on the very first draw, and only
    // while unused wildcards remain — each appears at most once per game).
    if (
      state.totalDrawn > 1 &&
      state.wildcardBag.length > 0 &&
      state.sinceWildcard >= WILDCARD_EVERY &&
      Math.random() < 0.6
    ) {
      state.sinceWildcard = 0;
      showWildcard();
      return;
    }

    showNextCard();
  }

  function showNextCard() {
    const lvl = currentLevel();
    if (!state.bags[lvl.id] || state.bags[lvl.id].length === 0) {
      state.bags[lvl.id] = buildBag(lvl.id);
    }
    const text = state.bags[lvl.id].pop();
    state.currentText = text;
    state.drawnInLevel++;

    // alternate who answers
    el.turnIndicator.textContent = state.names[state.turn] + " answers";
    state.turn = state.turn === 0 ? 1 : 0;

    el.cardText.textContent = text;
    el.card.classList.remove("flip");
    void el.card.offsetWidth; // reflow to restart animation
    el.card.classList.add("flip");

    // reset save button for the new card
    el.saveBtn.setAttribute("aria-pressed", "false");
    el.saveBtn.textContent = "♡ Keep";

    el.drawBtn.textContent = "Next";
    updateDeepenBtn();
  }

  function toggleSave() {
    if (!state.currentText) return;
    const idx = state.saved.indexOf(state.currentText);
    if (idx === -1) {
      state.saved.push(state.currentText);
      el.saveBtn.setAttribute("aria-pressed", "true");
      el.saveBtn.textContent = "♥ Kept";
    } else {
      state.saved.splice(idx, 1);
      el.saveBtn.setAttribute("aria-pressed", "false");
      el.saveBtn.textContent = "♡ Keep";
    }
  }

  // ---- level transition ----
  function deepen() {
    if (state.levelIndex >= LEVEL_ORDER.length - 1) return;
    state.levelIndex++;
    state.drawnInLevel = 0;
    const lvl = currentLevel();
    el.transitionName.textContent = "Entering: " + lvl.name;
    el.transitionBlurb.textContent = lvl.blurb;
    el.transition.classList.add("is-active");
  }

  function confirmTransition() {
    el.transition.classList.remove("is-active");
    renderLevelMeta();
    showNextCard();
  }

  // ---- wildcard ----
  let timerId = null;
  function showWildcard() {
    // Drawn without replacement; if none are left, just show a normal card.
    if (state.wildcardBag.length === 0) {
      showNextCard();
      return;
    }
    const w = state.wildcardBag.pop();
    el.wildcardTitle.textContent = w.title;
    el.wildcardBody.textContent = w.body;

    clearInterval(timerId);
    if (w.timer) {
      el.timerWrap.hidden = false;
      el.wildcardTimerBtn.hidden = false;
      el.timerDisplay.textContent = w.timer;
      el.wildcardTimerBtn.textContent = "Start timer";
      el.wildcardTimerBtn.onclick = () => runTimer(w.timer);
    } else {
      el.timerWrap.hidden = true;
      el.wildcardTimerBtn.hidden = true;
    }
    el.wildcard.classList.add("is-active");
  }

  function runTimer(seconds) {
    clearInterval(timerId);
    let remaining = seconds;
    el.timerDisplay.textContent = remaining;
    el.wildcardTimerBtn.disabled = true;
    timerId = setInterval(() => {
      remaining--;
      el.timerDisplay.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(timerId);
        el.timerDisplay.textContent = "♥";
        el.wildcardTimerBtn.disabled = false;
        el.wildcardTimerBtn.textContent = "Restart";
      }
    }, 1000);
  }

  function closeWildcard() {
    clearInterval(timerId);
    el.wildcard.classList.remove("is-active");
    el.wildcardTimerBtn.disabled = false;
    showNextCard();
  }

  // ---- reflection / end ----
  const CLOSERS = [
    "Connection isn't a destination. It's the willingness to keep peeling.",
    "You learned something tonight you can't unlearn. That's the point.",
    "The bravest thing two people can do is stay curious about each other.",
    "Every layer you opened tonight is a door you can walk through again.",
  ];

  function endGame() {
    showScreen("reflection");
    el.reflectionStat.textContent =
      "You drew " +
      state.totalDrawn +
      (state.totalDrawn === 1 ? " card" : " cards") +
      " and reached the " +
      currentLevel().name +
      " layer.";

    el.savedList.innerHTML = "";
    if (state.saved.length === 0) {
      const li = document.createElement("li");
      li.className = "saved-empty";
      li.textContent = "No cards kept — but the conversation was the keepsake.";
      el.savedList.appendChild(li);
    } else {
      state.saved.forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        el.savedList.appendChild(li);
      });
    }
    el.closingLine.textContent = pick(CLOSERS);
  }

  function startGame() {
    const a = el.nameA.value.trim();
    const b = el.nameB.value.trim();
    state.names = [a || "You", b || "Your partner"];
    persist();

    // reset session state
    state.levelIndex = 0;
    state.turn = 0;
    state.drawnInLevel = 0;
    state.totalDrawn = 0;
    state.sinceWildcard = 0;
    state.bags = {};
    state.wildcardBag = shuffle(WILDCARDS);
    state.saved = [];
    state.currentText = "";

    el.cardText.textContent = "Take a breath. Tap “Draw” when you're ready.";
    el.turnIndicator.textContent = "";
    el.drawBtn.textContent = "Draw";
    el.saveBtn.setAttribute("aria-pressed", "false");
    el.saveBtn.textContent = "♡ Keep";

    renderLevelMeta();
    updateDeepenBtn();
    showScreen("game");
  }

  // ---- wiring ----
  function init() {
    restorePrefs();
    applyTheme();
    el.nameA.value = state.names[0] === "You" ? "" : state.names[0];
    el.nameB.value = state.names[1] === "Your partner" ? "" : state.names[1];

    el.beginBtn.addEventListener("click", startGame);
    el.drawBtn.addEventListener("click", draw);
    el.skipBtn.addEventListener("click", showNextCard);
    el.saveBtn.addEventListener("click", toggleSave);
    el.deepenBtn.addEventListener("click", deepen);
    el.transitionBtn.addEventListener("click", confirmTransition);
    el.endBtn.addEventListener("click", endGame);
    el.wildcardBtn.addEventListener("click", closeWildcard);
    el.restartBtn.addEventListener("click", () => showScreen("setup"));

    el.themeBtn.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme();
      persist();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
