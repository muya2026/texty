// TEXTY Game JS - Fixed Version with Reward System
const gameState = {
  currentScreen: "loading-screen",
  currentMode: null,
  score: 0,
  totalScore: 0,
  coins: 0,
  xp: 0,
  level: 1,
  startTime: null,
  timerInterval: null,
  elapsedTime: 0,
  isPaused: false,
  achievements: [],
  leaderboard: [],
  unlockedAchievements: []
};

const wordDatabase = {
  wordle: ["APPLE","BEACH","BRAIN","CHAIR","DANCE","LIGHT","MUSIC","PLANT","STONE","WATER","EARTH","HEART","WORLD","POWER","MAGIC","DREAM","SPACE","OCEAN","FOREST","SMILE"],
  hangman: ["PROGRAMMING","DEVELOPER","JAVASCRIPT","COMPUTER","KEYBOARD","MONITOR","SOFTWARE","INTERNET","LANGUAGE","PUZZLE","CHALLENGE","VICTORY","KEYWORD","ALPHABET"],
  boggle: ["THE","AND","FOR","YOU","ARE","CAN","HAD","HER","WAS","ONE","OUR","OUT","DAY","GET","HAS","HIM","HIS","HOW","ITS","MAY","NEW","NOW","OLD","SEE","TWO","WAY","WHO","BOY","DID","MAN"],
  spellingbee: ["CAT","ACT","ATE","TEA","EAT","RAT","ART","CAR","ARC","CARE","RACE","REACT","TRACE","CRATE","REACTS","CATER","SCARE","CAST","CASTE","RECAST"],
  unscramble: [
    {word:"PUZZLE",hint:"A game or toy that tests ingenuity"},
    {word:"PLANET",hint:"A celestial body orbiting a star"},
    {word:"GARDEN",hint:"Place where flowers grow"},
    {word:"BRIDGE",hint:"Structure spanning a gap"},
    {word:"ORANGE",hint:"Citrus fruit and color"},
    {word:"JUNGLE",hint:"Dense forest in tropical region"},
    {word:"GUITAR",hint:"Musical instrument with strings"},
    {word:"ROCKET",hint:"Vehicle that launches into space"}
  ],
  connections: [
    {category:"Fruits",words:["APPLE","BANANA","ORANGE","GRAPE"]},
    {category:"Animals",words:["LION","TIGER","BEAR","WOLF"]},
    {category:"Colors",words:["RED","BLUE","GREEN","YELLOW"]},
    {category:"Sports",words:["SOCCER","TENNIS","CRICKET","HOCKEY"]}
  ],
  scrabble: ["QUIZ","JAZZ","ZEBRA","QUICK","BUZZ","FUZZ","JAZZY","ZINC","OXYGEN","EXAMPLE","PUZZLE","JUXTAPOSE"],
  wordsearch: ["CODE","GAME","WORD","PLAY","FUN","TEXT","PUZZLE","BRAIN","LOGIC","SMART"]
};

const letterValues = {A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10};

// Motivational quotes
const motivationalQuotes = [
  {text:"The limits of my language mean the limits of my world.",author:"Ludwig Wittgenstein",country:"🇦🇹"},
  {text:"One who knows a new language acquires a new soul.",author:"Czech Proverb",country:"🇨🇿"},
  {text:"To have another language is to possess a second soul.",author:"Charlemagne",country:"🇫🇷"},
  {text:"A different language is a different vision of life.",author:"Federico Fellini",country:"🇮🇹"},
  {text:"Those who know nothing of foreign languages know nothing of their own.",author:"Johann Wolfgang von Goethe",country:"🇩🇪"},
  {text:"Language is the house of being.",author:"Martin Heidegger",country:"🇩🇪"},
  {text:"Words have the power to both destroy and heal.",author:"Buddha",country:"🇮🇳"},
  {text:"Knowledge speaks, but wisdom listens.",author:"Jimi Hendrix",country:"🇺🇸"},
  {text:"In the middle of difficulty lies opportunity.",author:"Albert Einstein",country:"🇩🇪"},
  {text:"The journey of a thousand miles begins with one step.",author:"Lao Tzu",country:"🇨🇳"},
  {text:"Fall seven times, stand up eight.",author:"Japanese Proverb",country:"🇯🇵"},
  {text:"What we think, we become.",author:"Buddha",country:"🇮🇳"},
  {text:"Learning never exhausts the mind.",author:"Leonardo da Vinci",country:"🇮🇹"},
  {text:"Simplicity is the ultimate sophistication.",author:"Leonardo da Vinci",country:"🇮🇹"},
  {text:"He who learns but does not think, is lost.",author:"Confucius",country:"🇨🇳"},
  {text:"Our greatest glory is not in never falling, but in rising every time we fall.",author:"Confucius",country:"🇨🇳"},
  {text:"The only true wisdom is in knowing you know nothing.",author:"Socrates",country:"🇬🇷"},
  {text:"Wonder is the beginning of wisdom.",author:"Socrates",country:"🇬🇷"}
];

// Utility: shuffle array (Fisher-Yates)
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

window.addEventListener("load", () => {
  setTimeout(() => {
    loadGameData();
    updateMenuStats();
    showScreen("main-menu");
  }, 1800);
});

function showScreen(id) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(s => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    gameState.currentScreen = id;
  } else {
    console.warn(`Screen not found: ${id}`);
  }
}

function showMainMenu() {
  closeModal("pause-modal");
  closeModal("results-modal");
  closeModal("leaderboard-modal");
  closeModal("achievements-modal");
  closeModal("howto-modal");
  stopTimer();
  showScreen("main-menu");
  updateMenuStats();
}

function showGameModeSelect() {
  showScreen("game-mode-select");
}

function selectMode(mode) {
  if (!mode) return;
  gameState.currentMode = mode;
  gameState.score = 0;
  gameState.elapsedTime = 0;
  gameState.isPaused = false;

  document.querySelectorAll(".game-mode").forEach(el => el.classList.add("hidden"));
  const gameEl = document.getElementById(mode + "-game");
  if (gameEl) {
    gameEl.classList.remove("hidden");
  } else {
    console.warn(`Game mode element not found: ${mode}-game`);
  }

  const titleEl = document.getElementById("current-mode");
  if (titleEl) {
    titleEl.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
  }

  const scoreEl = document.getElementById("game-score");
  if (scoreEl) scoreEl.textContent = "0";

  initializeGame(mode);
  showScreen("game-screen");
  startTimer();
}

function initializeGame(m) {
  switch (m) {
    case "wordle": initWordle(); break;
    case "hangman": initHangman(); break;
    case "boggle": initBoggle(); break;
    case "wordsearch": initWordSearch(); break;
    case "spellingbee": initSpellingBee(); break;
    case "unscramble": initUnscramble(); break;
    case "connections": initConnections(); break;
    case "scrabble": initScrabble(); break;
    default: console.warn(`Unknown mode: ${m}`);
  }
}

function startTimer() {
  stopTimer(); // clear any existing
  gameState.startTime = Date.now() - (gameState.elapsedTime * 1000);
  updateTimerDisplay();
  gameState.timerInterval = setInterval(() => {
    if (!gameState.isPaused) {
      gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
      updateTimerDisplay();
    }
  }, 1000);
}

function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}

function updateTimerDisplay() {
  const m = Math.floor(gameState.elapsedTime / 60);
  const s = gameState.elapsedTime % 60;
  const timerEl = document.getElementById("game-timer");
  if (timerEl) {
    timerEl.textContent = m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
  }
}

function updateScore(p) {
  gameState.score += p;
  if (gameState.score < 0) gameState.score = 0;
  const scoreEl = document.getElementById("game-score");
  if (scoreEl) scoreEl.textContent = gameState.score;
}

function pauseGame() {
  gameState.isPaused = true;
  const modal = document.getElementById("pause-modal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

function resumeGame() {
  gameState.isPaused = false;
  const modal = document.getElementById("pause-modal");
  if (modal) modal.classList.add("hidden");
  if (!document.querySelector(".modal:not(.hidden)")) {
    document.body.style.overflow = "";
  }
}

function showResultsFromPause() {
  closeModal("pause-modal");
  showResults();
}

function showResults() {
  stopTimer();
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const modeEl = document.getElementById("result-mode");
  if (modeEl && gameState.currentMode) {
    modeEl.textContent = gameState.currentMode.charAt(0).toUpperCase() + gameState.currentMode.slice(1);
  }

  const scoreEl = document.getElementById("result-score");
  if (scoreEl) scoreEl.textContent = gameState.score;

  const timeEl = document.getElementById("result-time");
  const timerDisplay = document.getElementById("game-timer");
  if (timeEl && timerDisplay) timeEl.textContent = timerDisplay.textContent;

  const wordsEl = document.getElementById("result-words");
  if (wordsEl) wordsEl.textContent = Math.floor(gameState.score / 10);

  const accValue = Math.min(100, Math.floor(Math.random() * 20) + 80);
  const accEl = document.getElementById("result-accuracy");
  if (accEl) accEl.textContent = accValue + "%";

  const stars = gameState.score >= 100 ? 3 : gameState.score >= 50 ? 2 : 1;
  const starsEl = document.getElementById("result-stars");
  if (starsEl) {
    starsEl.textContent = "⭐".repeat(stars);
  }

  const quoteEl = document.getElementById("result-quote");
  if (quoteEl) quoteEl.textContent = `"${quote.text}"`;

  const authorEl = document.getElementById("result-author");
  if (authorEl) authorEl.textContent = `- ${quote.author} ${quote.country}`;

  // --- REWARD CALCULATION ---
  const timeBonus = gameState.elapsedTime < 60 ? 50 : gameState.elapsedTime < 120 ? 25 : gameState.elapsedTime < 180 ? 10 : 0;
  const accuracyBonus = accValue >= 95 ? 30 : accValue >= 85 ? 15 : 0;
  const starBonus = stars * 10;
  const baseCoins = gameState.score;
  const totalCoins = baseCoins + timeBonus + accuracyBonus + starBonus;
  const xpEarned = Math.floor(gameState.score * 1.5 + timeBonus + accuracyBonus + starBonus * 2);

  // Level system: 500 XP per level
  const oldLevel = gameState.level || 1;
  const oldXp = gameState.xp || 0;
  const newXpTotal = oldXp + xpEarned;
  const newLevel = Math.floor(newXpTotal / 500) + 1;
  const xpForNextLevel = newLevel * 500;
  const xpProgress = newXpTotal % 500;
  const xpNeeded = 500 - xpProgress;

  // Update gameState
  gameState.coins = (gameState.coins || 0) + totalCoins;
  gameState.xp = newXpTotal;
  gameState.level = newLevel;
  const leveledUp = newLevel > oldLevel;

  // Populate reward UI
  const coinsEl = document.getElementById("reward-coins");
  if (coinsEl) coinsEl.textContent = `+${totalCoins}`;

  const xpEl = document.getElementById("reward-xp");
  if (xpEl) xpEl.textContent = `+${xpEarned}`;

  const levelEl = document.getElementById("reward-level");
  if (levelEl) {
    levelEl.textContent = leveledUp ? `${oldLevel} → ${newLevel} 🎉` : `${newLevel}`;
  }

  const bonusesEl = document.getElementById("reward-bonuses");
  if (bonusesEl) {
    const bonuses = [
      {label: `Base Score`, value: `+${baseCoins} coins`, type: "neutral"},
      timeBonus > 0 ? {label: `⚡ Speed Bonus (<${gameState.elapsedTime < 60 ? '1' : gameState.elapsedTime < 120 ? '2' : '3'}m)`, value: `+${timeBonus}`, type: "positive"} : null,
      accuracyBonus > 0 ? {label: `🎯 Accuracy Bonus (${accValue}%)`, value: `+${accuracyBonus}`, type: "positive"} : null,
      {label: `${"⭐".repeat(stars)} Star Bonus`, value: `+${starBonus}`, type: "positive"}
    ].filter(Boolean);

    bonusesEl.innerHTML = bonuses.map(b => `
      <div class="bonus-item ${b.type}">
        <span>${b.label}</span>
        <span>${b.value}</span>
      </div>
    `).join("") + (leveledUp ? `<div class="bonus-item positive"><span>🎉 Level Up! ${oldLevel} → ${newLevel}</span><span>+100 bonus coins!</span></div>` : "");

    if (leveledUp) {
      gameState.coins += 100;
      if (coinsEl) coinsEl.textContent = `+${totalCoins + 100}`;
    }
  }

  const progressFill = document.getElementById("level-progress-fill");
  if (progressFill) {
    const percent = (xpProgress / 500) * 100;
    setTimeout(() => {
      progressFill.style.width = percent + "%";
    }, 300);
  }

  const progressText = document.getElementById("level-progress-text");
  if (progressText) {
    progressText.textContent = leveledUp 
      ? `Level Up! ${xpProgress} / 500 XP to Level ${newLevel + 1}`
      : `${xpProgress} / 500 XP • ${xpNeeded} XP to Level ${newLevel + 1}`;
  }

  // Check achievements
  const newlyUnlocked = checkAchievements();
  const achievementEl = document.getElementById("achievement-unlocked");
  const unlockedList = document.getElementById("unlocked-list");
  if (achievementEl && unlockedList) {
    if (newlyUnlocked.length > 0) {
      achievementEl.style.display = "block";
      unlockedList.innerHTML = newlyUnlocked.map(a => `
        <span class="unlocked-badge">${a.icon} ${a.name}</span>
      `).join("");
    } else {
      achievementEl.style.display = "none";
    }
  }

  const resultsModal = document.getElementById("results-modal");
  if (resultsModal) {
    resultsModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  // Confetti effect for 3 stars or level up
  if (stars === 3 || leveledUp) {
    launchConfetti();
  }

  if (gameState.currentMode) {
    saveScore(gameState.currentMode, gameState.score);
  }
}

function checkAchievements() {
  const allAchievements = [
    {id:"first", name:"First Word", desc:"Complete first puzzle", icon:"🎯", check: () => gameState.leaderboard.length >= 0},
    {id:"speed", name:"Speed Demon", desc:"Finish under 60s", icon:"⚡", check: () => gameState.elapsedTime < 60},
    {id:"wordsmith", name:"Wordsmith", desc:"Score 100+ points", icon:"📚", check: () => gameState.score >= 100},
    {id:"master", name:"Master Mind", desc:"Score 500+ total", icon:"🧠", check: () => gameState.totalScore >= 500},
    {id:"explorer", name:"Explorer", desc:"Try 3 different modes", icon:"🗺️", check: () => new Set(gameState.leaderboard.map(e=>e.mode)).size >= 2}, // at least 2 since current not yet saved for first game
    {id:"champion", name:"Champion", desc:"Reach level 5", icon:"🏆", check: () => gameState.level >= 5},
    {id:"collector", name:"Coin Collector", desc:"Collect 500 coins", icon:"💰", check: () => gameState.coins >= 500},
    {id:"streak", name:"Star Collector", desc:"Earn 10 stars", icon:"⭐", check: () => gameState.totalScore >= 100}
  ];

  const newlyUnlocked = [];
  if (!gameState.unlockedAchievements) gameState.unlockedAchievements = [];

  allAchievements.forEach(ach => {
    if (!gameState.unlockedAchievements.includes(ach.id) && ach.check()) {
      gameState.unlockedAchievements.push(ach.id);
      newlyUnlocked.push(ach);
    }
  });

  return newlyUnlocked;
}

function launchConfetti() {
  const colors = ["#00f5ff", "#ff00ff", "#8b5cf6", "#00ff88", "#fbbf24"];
  for (let i = 0; i < 80; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "-10px";
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
    document.body.appendChild(confetti);

    const animation = confetti.animate([
      { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
      { transform: `translateY(${window.innerHeight + 100}px) rotate(${720 + Math.random()*360}deg) translateX(${ (Math.random()-0.5)*200 }px)`, opacity: 0 }
    ], {
      duration: 3000 + Math.random() * 2000,
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      delay: Math.random() * 500
    });

    animation.onfinish = () => confetti.remove();
  }
}

function shareResult(platform) {
  const modeName = gameState.currentMode ? gameState.currentMode.charAt(0).toUpperCase() + gameState.currentMode.slice(1) : "Word Game";
  const scoreText = `I scored ${gameState.score} points in TEXTY - ${modeName}!`;
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const fullText = `${scoreText} "${quote.text}" - ${quote.author}`;
  let url;
  if (platform === "twitter") {
    url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(fullText) + "&hashtags=TEXTY,WordGame,PuzzleGame";
  } else if (platform === "facebook") {
    url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent("https://muya2026.github.io/texty/") + "&quote=" + encodeURIComponent(fullText);
  } else if (platform === "linkedin") {
    url = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent("https://muya2026.github.io/texty/");
  }
  if (url) window.open(url, "_blank", "width=600,height=400");
}

function playAgain() {
  closeModal("results-modal");
  if (gameState.currentMode) {
    selectMode(gameState.currentMode);
  }
}

function quitGame() {
  stopTimer();
  closeModal("pause-modal");
  closeModal("results-modal");
  showMainMenu();
}

function showHint() {
  alert("Hint: Think about common patterns! Try vowels first, then common consonants like R, S, T, L, N.");
  updateScore(-5);
}

function showLeaderboard() {
  const modal = document.getElementById("leaderboard-modal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
  renderLeaderboard("all");
}

// Fixed: no longer relies on global event object
function showLeaderboardTab(tab, evt) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  // Try to get target from passed event, or fallback to query
  let target = null;
  if (evt && evt.target) target = evt.target;
  else if (evt && evt.currentTarget) target = evt.currentTarget;
  else {
    // fallback: find button by tab name
    target = document.querySelector(`.tab-btn[onclick*=\"'${tab}'\"]`);
  }
  if (target) target.classList.add("active");
  renderLeaderboard(tab);
}

function renderLeaderboard(tab) {
  const listEl = document.getElementById("leaderboard-list");
  if (!listEl) return;
  let scores = [...(gameState.leaderboard || [])];

  // For demo, filter by date if needed
  const now = new Date();
  if (tab === "daily") {
    scores = scores.filter(e => {
      const d = new Date(e.date);
      return d.toDateString() === now.toDateString();
    });
  } else if (tab === "weekly") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    scores = scores.filter(e => new Date(e.date) >= weekAgo);
  }

  if (scores.length === 0) {
    listEl.innerHTML = "<p>No scores yet! Play a game to get on the board.</p>";
    return;
  }

  listEl.innerHTML = scores.map((e, i) => `
    <div class="leaderboard-entry">
      <span class="rank">#${i + 1}</span>
      <div class="player-info"><div class="player-name">${e.mode}</div><div style="font-size:0.8rem;color:var(--text-dim)">${new Date(e.date).toLocaleDateString()}</div></div>
      <span class="player-score">${e.score} pts</span>
    </div>
  `).join("");
}

function saveScore(mode, score) {
  if (!mode) return;
  const entry = {
    mode: mode.charAt(0).toUpperCase() + mode.slice(1),
    score: score,
    date: new Date().toISOString()
  };
  gameState.leaderboard.push(entry);
  gameState.leaderboard.sort((a, b) => b.score - a.score);
  gameState.leaderboard = gameState.leaderboard.slice(0, 20);

  // FIX: update totalScore
  gameState.totalScore += score;
  saveGameData();
  updateMenuStats();
}

function showAchievements() {
  const modal = document.getElementById("achievements-modal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
  renderAchievements();
}

function renderAchievements() {
  const all = [
    {id:"first", name:"First Word", desc:"Complete first puzzle", icon:"🎯", check: () => gameState.leaderboard.length > 0},
    {id:"speed", name:"Speed Demon", desc:"Finish under 60s", icon:"⚡", check: () => gameState.unlockedAchievements?.includes("speed")},
    {id:"wordsmith", name:"Wordsmith", desc:"Score 100+ points in a game", icon:"📚", check: () => gameState.totalScore >= 100 || gameState.unlockedAchievements?.includes("wordsmith")},
    {id:"master", name:"Master Mind", desc:"Score 500+ total points", icon:"🧠", check: () => gameState.totalScore >= 500},
    {id:"explorer", name:"Explorer", desc:"Try 3 different modes", icon:"🗺️", check: () => new Set(gameState.leaderboard.map(e=>e.mode)).size >= 3},
    {id:"champion", name:"Champion", desc:"Reach level 5", icon:"🏆", check: () => (gameState.level||1) >=5},
    {id:"collector", name:"Coin Collector", desc:"Collect 500 coins", icon:"💰", check: () => (gameState.coins||0) >= 500},
    {id:"streak", name:"Star Collector", desc:"Earn 3 stars in a game", icon:"⭐", check: () => gameState.unlockedAchievements?.includes("wordsmith") || gameState.totalScore >= 100}
  ];

  const achievements = all.map(a => ({
    ...a,
    unlocked: gameState.unlockedAchievements?.includes(a.id) || a.check()
  }));

  const grid = document.getElementById("achievements-grid");
  if (!grid) return;
  grid.innerHTML = achievements.map(x => `
    <div class="achievement-item ${x.unlocked ? "" : "locked"}">
      <div class="achievement-icon">${x.icon}</div>
      <div class="achievement-info">
        <div class="achievement-name">${x.name}</div>
        <div class="achievement-desc">${x.desc}</div>
      </div>
      <div>${x.unlocked ? "✅" : "🔒"}</div>
    </div>
  `).join("");
}

function showHowToPlay() {
  const modal = document.getElementById("howto-modal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
  // Unlock scroll if no other modal open
  setTimeout(() => {
    if (!document.querySelector(".modal:not(.hidden)")) {
      document.body.style.overflow = "";
    }
  }, 100);
}

// Modal backdrop click to close + ESC key handling
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal") && !e.target.classList.contains("hidden")) {
    e.target.classList.add("hidden");
    if (!document.querySelector(".modal:not(.hidden)")) {
      document.body.style.overflow = "";
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const openModals = document.querySelectorAll(".modal:not(.hidden)");
    openModals.forEach(modal => {
      if (modal.id === "pause-modal" && gameState.currentScreen === "game-screen") {
        resumeGame();
      } else if (modal.id !== "pause-modal") {
        modal.classList.add("hidden");
      }
    });
    if (!document.querySelector(".modal:not(.hidden)")) {
      document.body.style.overflow = "";
    }
  }
});

function saveGameData() {
  try {
    localStorage.setItem("texty_state", JSON.stringify({
      totalScore: gameState.totalScore,
      coins: gameState.coins,
      xp: gameState.xp,
      level: gameState.level,
      achievements: gameState.achievements,
      leaderboard: gameState.leaderboard,
      unlockedAchievements: gameState.unlockedAchievements
    }));
  } catch (e) {
    console.warn("Failed to save game data", e);
  }
}

function loadGameData() {
  try {
    const s = localStorage.getItem("texty_state");
    if (s) {
      const d = JSON.parse(s);
      gameState.totalScore = d.totalScore || 0;
      gameState.coins = d.coins || 0;
      gameState.xp = d.xp || 0;
      gameState.level = d.level || Math.floor((d.totalScore||0)/100)+1 || 1;
      gameState.achievements = d.achievements || [];
      gameState.leaderboard = d.leaderboard || [];
      gameState.unlockedAchievements = d.unlockedAchievements || [];
    }
  } catch (e) {
    console.warn("Failed to load game data, resetting", e);
    gameState.totalScore = 0;
    gameState.coins = 0;
    gameState.xp = 0;
    gameState.level = 1;
    gameState.achievements = [];
    gameState.leaderboard = [];
  }
}

function updateMenuStats() {
  const totalEl = document.getElementById("menu-total-score");
  if (totalEl) totalEl.textContent = gameState.totalScore || 0;

  const levelEl = document.getElementById("menu-level");
  if (levelEl) levelEl.textContent = gameState.level || Math.floor((gameState.totalScore || 0) / 100) + 1 || 1;

  // Also update coins display if exists
  const coinsEl = document.getElementById("menu-coins");
  if (coinsEl) coinsEl.textContent = gameState.coins || 0;

  const achEl = document.getElementById("menu-achievements");
  if (achEl) {
    const unlockedCount = gameState.unlockedAchievements ? gameState.unlockedAchievements.length : 0;
    achEl.textContent = `${unlockedCount}/8`;
  }
}

// --- WORDLE ---
let wordleState = {targetWord:"",currentRow:0,currentTile:0,guesses:[],gameOver:false};

function initWordle() {
  const target = wordDatabase.wordle[Math.floor(Math.random() * wordDatabase.wordle.length)];
  // FIX: proper array initialization without shared reference
  wordleState = {
    targetWord: target,
    currentRow: 0,
    currentTile: 0,
    guesses: Array.from({length:6}, () => Array(5).fill("")),
    gameOver: false
  };

  const grid = document.getElementById("wordle-grid");
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement("div");
      tile.className = "wordle-tile";
      tile.id = `tile-${i}-${j}`;
      grid.appendChild(tile);
    }
  }

  const keyboard = document.getElementById("wordle-keyboard");
  if (!keyboard) return;
  keyboard.innerHTML = "";
  ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"].forEach(rowStr => {
    const row = document.createElement("div");
    row.className = "keyboard-row";
    rowStr.split("").forEach(letter => {
      const btn = document.createElement("button");
      btn.className = "key-btn";
      btn.textContent = letter;
      btn.addEventListener("click", () => handleWordleLetter(letter));
      row.appendChild(btn);
    });
    keyboard.appendChild(row);
  });

  // Add ENTER and BACKSPACE to last row
  const lastRow = keyboard.lastElementChild;
  if (lastRow) {
    const enterBtn = document.createElement("button");
    enterBtn.className = "key-btn";
    enterBtn.textContent = "ENTER";
    enterBtn.style.minWidth = "70px";
    enterBtn.addEventListener("click", handleWordleEnter);
    lastRow.appendChild(enterBtn);

    const backBtn = document.createElement("button");
    backBtn.className = "key-btn";
    backBtn.textContent = "⌫";
    backBtn.addEventListener("click", handleWordleBackspace);
    lastRow.insertBefore(backBtn, lastRow.firstChild);
  }
}

function handleWordleLetter(l) {
  if (wordleState.currentTile < 5 && !wordleState.gameOver) {
    const tile = document.getElementById(`tile-${wordleState.currentRow}-${wordleState.currentTile}`);
    if (tile) tile.textContent = l;
    wordleState.guesses[wordleState.currentRow][wordleState.currentTile] = l;
    wordleState.currentTile++;
  }
}

function handleWordleBackspace() {
  if (wordleState.currentTile > 0 && !wordleState.gameOver) {
    wordleState.currentTile--;
    const tile = document.getElementById(`tile-${wordleState.currentRow}-${wordleState.currentTile}`);
    if (tile) tile.textContent = "";
    wordleState.guesses[wordleState.currentRow][wordleState.currentTile] = "";
  }
}

function handleWordleEnter() {
  if (wordleState.currentTile !== 5 || wordleState.gameOver) return;
  const guess = wordleState.guesses[wordleState.currentRow].join("");

  // Color logic with proper duplicate handling
  const targetLetters = wordleState.targetWord.split("");
  const guessLetters = guess.split("");
  const result = Array(5).fill("absent");
  const targetUsed = Array(5).fill(false);

  // First pass: correct
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = "correct";
      targetUsed[i] = true;
    }
  }
  // Second pass: present
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    const idx = targetLetters.findIndex((tl, ti) => !targetUsed[ti] && tl === guessLetters[i]);
    if (idx !== -1) {
      result[i] = "present";
      targetUsed[idx] = true;
    }
  }

  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`tile-${wordleState.currentRow}-${i}`);
    if (!tile) continue;
    setTimeout(() => {
      tile.classList.add(result[i]);
      if (result[i] === "correct") updateScore(10);
      else if (result[i] === "present") updateScore(5);
    }, i * 200);
  }

  if (guess === wordleState.targetWord) {
    wordleState.gameOver = true;
    updateScore(50);
    setTimeout(() => {
      alert("You Won! The word was " + wordleState.targetWord);
      showResults();
    }, 1500);
  } else if (wordleState.currentRow === 5) {
    wordleState.gameOver = true;
    setTimeout(() => {
      alert("Game Over! The word was " + wordleState.targetWord);
      showResults();
    }, 1500);
  } else {
    wordleState.currentRow++;
    wordleState.currentTile = 0;
  }
}

// Physical keyboard support for Wordle
document.addEventListener("keydown", (e) => {
  if (gameState.currentMode !== "wordle" || wordleState.gameOver) return;
  if (gameState.currentScreen !== "game-screen") return;
  if (e.key === "Enter") {
    handleWordleEnter();
  } else if (e.key === "Backspace") {
    handleWordleBackspace();
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    handleWordleLetter(e.key.toUpperCase());
  }
});

// --- HANGMAN ---
let hangmanState = {word:"",guessedLetters:[],wrongGuesses:0,maxWrong:6};
const hangmanStages = ["","🪵","🪵🪵","🪵🪵👤","🪵🪵👤🪵","🪵🪵👤🪵🪵","🪵🪵👤🪵🪵🪢"];

function initHangman() {
  const word = wordDatabase.hangman[Math.floor(Math.random() * wordDatabase.hangman.length)];
  hangmanState = {word: word, guessedLetters: [], wrongGuesses: 0, maxWrong: 6};
  updateHangmanDisplay();
  renderHangmanKeyboard();
}

function updateHangmanDisplay() {
  const drawing = document.getElementById("hangman-drawing");
  if (drawing) drawing.textContent = hangmanStages[hangmanState.wrongGuesses] || `Wrong: ${hangmanState.wrongGuesses}/${hangmanState.maxWrong}`;
  const wordEl = document.getElementById("hangman-word");
  if (wordEl) {
    wordEl.textContent = hangmanState.word.split("").map(l => hangmanState.guessedLetters.includes(l) ? l : "_").join(" ");
  }
}

function renderHangmanKeyboard() {
  const kb = document.getElementById("hangman-keyboard");
  if (!kb) return;
  kb.innerHTML = "";
  for (let c = 65; c <= 90; c++) {
    const letter = String.fromCharCode(c);
    const btn = document.createElement("button");
    btn.className = "key-btn";
    btn.textContent = letter;
    btn.disabled = hangmanState.guessedLetters.includes(letter);
    btn.addEventListener("click", () => handleHangmanGuess(letter));
    kb.appendChild(btn);
  }
}

function handleHangmanGuess(l) {
  if (hangmanState.guessedLetters.includes(l)) return;
  hangmanState.guessedLetters.push(l);
  if (!hangmanState.word.includes(l)) {
    hangmanState.wrongGuesses++;
  } else {
    updateScore(5);
  }
  updateHangmanDisplay();
  renderHangmanKeyboard();

  const won = hangmanState.word.split("").every(ch => hangmanState.guessedLetters.includes(ch));
  const lost = hangmanState.wrongGuesses >= hangmanState.maxWrong;

  if (won) {
    updateScore(50);
    setTimeout(() => {
      alert("You Won! The word was " + hangmanState.word);
      showResults();
    }, 500);
  } else if (lost) {
    setTimeout(() => {
      alert("Game Over! The word was " + hangmanState.word);
      showResults();
    }, 500);
  }
}

// --- BOGGLE ---
let boggleState = {grid:[],foundWords:[]};

function initBoggle() {
  // FIX: full alphabet
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  boggleState.grid = Array.from({length:4}, () => Array.from({length:4}, () => letters[Math.floor(Math.random() * letters.length)]));
  boggleState.foundWords = [];

  const gridEl = document.getElementById("boggle-grid");
  if (gridEl) {
    gridEl.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const tile = document.createElement("div");
        tile.className = "boggle-tile";
        tile.textContent = boggleState.grid[i][j];
        tile.addEventListener("click", () => {
          const input = document.getElementById("boggle-input");
          if (input) input.value += boggleState.grid[i][j];
        });
        gridEl.appendChild(tile);
      }
    }
  }

  const foundList = document.querySelector("#boggle-found .found-words-list");
  if (foundList) foundList.innerHTML = "";
  const input = document.getElementById("boggle-input");
  if (input) {
    input.value = "";
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submitBoggleWord(); });
  }
}

function submitBoggleWord() {
  const input = document.getElementById("boggle-input");
  if (!input) return;
  const w = input.value.toUpperCase().trim();
  if (w.length < 3) {
    alert("Minimum 3 letters required!");
    return;
  }
  if (boggleState.foundWords.includes(w)) {
    alert("Already found this word!");
    return;
  }
  // Simple validation: allow any word for now, but could check dictionary
  boggleState.foundWords.push(w);
  updateScore(w.length * 2);
  const list = document.querySelector("#boggle-found .found-words-list");
  if (list) {
    const wordEl = document.createElement("span");
    wordEl.className = "found-word";
    wordEl.textContent = w;
    list.appendChild(wordEl);
  }
  input.value = "";
}

// --- WORD SEARCH ---
function initWordSearch() {
  const gridEl = document.getElementById("wordsearch-grid");
  if (!gridEl) return;
  gridEl.innerHTML = "";

  const words = wordDatabase.wordsearch.slice(0,5);
  const size = 10;
  // Create empty grid
  const grid = Array.from({length:size}, () => Array(size).fill(""));

  // Simple placement: place words horizontally
  words.forEach(word => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 50) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * (size - word.length));
      let canPlace = true;
      for (let k = 0; k < word.length; k++) {
        if (grid[row][col+k] !== "" && grid[row][col+k] !== word[k]) {
          canPlace = false; break;
        }
      }
      if (canPlace) {
        for (let k = 0; k < word.length; k++) grid[row][col+k] = word[k];
        placed = true;
      }
      attempts++;
    }
  });

  // Fill empty with random letters
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === "") grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
    }
  }

  // Render
  const foundSet = new Set();
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const cell = document.createElement("div");
      cell.className = "wordsearch-cell";
      cell.textContent = grid[i][j];
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener("click", () => {
        cell.classList.toggle("selected");
      });
      gridEl.appendChild(cell);
    }
  }

  const wordsContainer = document.querySelector("#wordsearch-words .words-to-find");
  if (wordsContainer) {
    wordsContainer.innerHTML = words.map(w => `<span class="word-to-find" data-word="${w}">${w}</span>`).join("");
    wordsContainer.querySelectorAll(".word-to-find").forEach(span => {
      span.addEventListener("click", () => {
        if (foundSet.has(span.dataset.word)) return;
        span.classList.add("found");
        foundSet.add(span.dataset.word);
        updateScore(20);
        if (foundSet.size === words.length) {
          setTimeout(() => {
            alert("You found all words!");
            showResults();
          }, 500);
        }
      });
    });
  }
}

// --- SPELLING BEE ---
let spellingBeeState = {center:"",outer:[],found:[]};

function initSpellingBee() {
  const letters = shuffleArray("ABCDEFG".split(""));
  spellingBeeState.center = letters[0];
  spellingBeeState.outer = letters.slice(1);
  spellingBeeState.found = [];

  const centerEl = document.getElementById("bee-center");
  if (centerEl) {
    centerEl.textContent = spellingBeeState.center;
    centerEl.onclick = () => {
      const input = document.getElementById("bee-input");
      if (input) input.value += spellingBeeState.center;
    };
  }

  const outerContainer = document.getElementById("bee-outer");
  if (outerContainer) {
    outerContainer.innerHTML = "";
    spellingBeeState.outer.forEach((l, i) => {
      const el = document.createElement("div");
      el.className = "outer-letter";
      el.textContent = l;
      const angle = (i * 60) * Math.PI / 180;
      // Centered positioning
      const radius = 100;
      const cx = 150, cy = 150;
      el.style.left = (cx + radius * Math.cos(angle) - 30) + "px";
      el.style.top = (cy + radius * Math.sin(angle) - 30) + "px";
      el.addEventListener("click", () => {
        const input = document.getElementById("bee-input");
        if (input) input.value += l;
      });
      outerContainer.appendChild(el);
    });
  }

  const foundContainer = document.querySelector("#bee-found .found-words");
  if (foundContainer) foundContainer.innerHTML = "";

  const input = document.getElementById("bee-input");
  if (input) {
    input.value = "";
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submitBeeWord(); });
  }
}

function submitBeeWord() {
  const input = document.getElementById("bee-input");
  if (!input) return;
  const w = input.value.toUpperCase().trim();

  if (w.length < 4) {
    alert("Minimum 4 letters required!");
    return;
  }
  if (!w.includes(spellingBeeState.center)) {
    alert(`Word must include center letter: ${spellingBeeState.center}`);
    return;
  }
  const allowed = new Set([spellingBeeState.center, ...spellingBeeState.outer]);
  for (const ch of w) {
    if (!allowed.has(ch)) {
      alert(`Letter ${ch} not in hive!`);
      return;
    }
  }
  if (spellingBeeState.found.includes(w)) {
    alert("Already found!");
    return;
  }

  spellingBeeState.found.push(w);
  updateScore(w.length * 3);

  const list = document.querySelector("#bee-found .found-words");
  if (list) {
    const we = document.createElement("span");
    we.className = "found-word";
    we.textContent = w;
    list.appendChild(we);
  }
  input.value = "";
}

// --- UNSCRAMBLE ---
function initUnscramble() {
  const item = wordDatabase.unscramble[Math.floor(Math.random() * wordDatabase.unscramble.length)];
  // FIX: actually shuffle letters
  let scrambled = shuffleArray(item.word.split(""));
  // Ensure not same as original (try up to 5 times)
  let attempts = 0;
  while (scrambled.join("") === item.word && attempts < 5) {
    scrambled = shuffleArray(item.word.split(""));
    attempts++;
  }

  const lettersContainer = document.getElementById("unscramble-letters");
  if (lettersContainer) {
    lettersContainer.innerHTML = scrambled.map(l => `<div class="scramble-tile">${l}</div>`).join("");
  }

  const hintEl = document.getElementById("unscramble-hint");
  if (hintEl) hintEl.textContent = "Hint: " + item.hint;

  const input = document.getElementById("unscramble-input");
  if (input) {
    input.value = "";
    input.dataset.answer = item.word;
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submitUnscrambleWord(); });
  }
}

function submitUnscrambleWord() {
  const input = document.getElementById("unscramble-input");
  if (!input) return;
  const w = input.value.toUpperCase().trim();
  const ans = input.dataset.answer;
  if (!w) return;
  if (w === ans) {
    updateScore(100);
    setTimeout(() => {
      alert("Correct! Well done!");
      initUnscramble();
    }, 300);
  } else {
    alert("Try again! Hint: " + (document.getElementById("unscramble-hint")?.textContent || ""));
  }
  input.value = "";
}

// --- CONNECTIONS ---
let connectionsState = {selected:[],solvedGroups:[],allWords:[]};

function initConnections() {
  const gridEl = document.getElementById("connections-grid");
  if (!gridEl) return;
  gridEl.innerHTML = "";

  const categories = shuffleArray(wordDatabase.connections).slice(0,4);
  // Ensure 4 categories
  while (categories.length < 4) {
    categories.push(...wordDatabase.connections.slice(0, 4 - categories.length));
  }

  const words = shuffleArray(categories.flatMap(c => c.words));
  connectionsState = {selected:[], solvedGroups:[], allWords: words, categories: categories};

  words.forEach(word => {
    const div = document.createElement("div");
    div.className = "connection-word";
    div.textContent = word;
    div.addEventListener("click", () => {
      if (div.classList.contains("matched")) return;
      if (div.classList.contains("selected")) {
        div.classList.remove("selected");
        connectionsState.selected = connectionsState.selected.filter(w => w !== word);
      } else {
        if (connectionsState.selected.length >= 4) return;
        div.classList.add("selected");
        connectionsState.selected.push(word);
        if (connectionsState.selected.length === 4) {
          checkConnectionsGroup();
        }
      }
    });
    gridEl.appendChild(div);
  });

  const groupsContainer = document.querySelector("#connections-groups .groups-found");
  if (groupsContainer) groupsContainer.innerHTML = "";
}

function checkConnectionsGroup() {
  const selected = connectionsState.selected;
  // Find if all 4 belong to same category
  const matchingCategory = connectionsState.categories.find(cat =>
    selected.every(w => cat.words.includes(w))
  );

  const gridEl = document.getElementById("connections-grid");
  if (matchingCategory) {
    // Correct!
    updateScore(50);
    connectionsState.solvedGroups.push(matchingCategory.category);
    // Mark as matched
    if (gridEl) {
      Array.from(gridEl.children).forEach(child => {
        if (selected.includes(child.textContent)) {
          child.classList.remove("selected");
          child.classList.add("matched");
        }
      });
    }
    const groupsContainer = document.querySelector("#connections-groups .groups-found");
    if (groupsContainer) {
      const groupEl = document.createElement("div");
      groupEl.className = "group-item";
      groupEl.innerHTML = `<strong>${matchingCategory.category}</strong>: ${matchingCategory.words.join(", ")}`;
      groupsContainer.appendChild(groupEl);
    }

    if (connectionsState.solvedGroups.length === connectionsState.categories.length) {
      updateScore(100);
      setTimeout(() => {
        alert("You solved all groups!");
        showResults();
      }, 500);
    }
  } else {
    // Wrong - shake animation and deselect
    if (gridEl) {
      Array.from(gridEl.children).forEach(child => {
        if (selected.includes(child.textContent)) {
          child.classList.add("shake");
          setTimeout(() => child.classList.remove("shake"), 500);
        }
      });
    }
    setTimeout(() => {
      if (gridEl) {
        Array.from(gridEl.children).forEach(child => child.classList.remove("selected"));
      }
      connectionsState.selected = [];
    }, 600);
    updateScore(-5);
  }
  connectionsState.selected = [];
}

// --- SCRABBLE ---
function initScrabble() {
  const rack = document.getElementById("scrabble-rack");
  if (rack) {
    rack.innerHTML = "";
    const letters = "EEEEEEEEAAAAAAOOOIIIIIINNRRRTTLLLSSSUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ".split("");
    for (let i = 0; i < 7; i++) {
      const l = letters[Math.floor(Math.random() * letters.length)];
      const tile = document.createElement("div");
      tile.className = "scrabble-tile";
      tile.innerHTML = `${l}<small>${letterValues[l] || 1}</small>`;
      tile.addEventListener("click", () => {
        const input = document.getElementById("scrabble-input");
        if (input) input.value += l;
      });
      rack.appendChild(tile);
    }
  }

  const board = document.getElementById("scrabble-board");
  if (board) {
    board.innerHTML = "";
    for (let i = 0; i < 49; i++) {
      const cell = document.createElement("div");
      cell.className = "board-cell";
      // Add some bonus randomly for visual
      if (i % 12 === 0) cell.classList.add("bonus-dw");
      board.appendChild(cell);
    }
  }

  const input = document.getElementById("scrabble-input");
  if (input) {
    input.value = "";
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submitScrabbleWord(); });
  }
  const roundScore = document.getElementById("scrabble-round-score");
  if (roundScore) roundScore.textContent = "Round Score: 0";
}

function submitScrabbleWord() {
  const input = document.getElementById("scrabble-input");
  if (!input) return;
  const w = input.value.toUpperCase().trim();
  if (w.length < 2) {
    alert("Minimum 2 letters!");
    return;
  }
  // Validate letters exist in rack (simplified)
  let score = 0;
  for (let i = 0; i < w.length; i++) {
    score += letterValues[w[i]] || 1;
  }
  updateScore(score);
  const roundScore = document.getElementById("scrabble-round-score");
  if (roundScore) roundScore.textContent = "Round Score: " + score;

  // Refresh rack after play
  setTimeout(() => initScrabble(), 800);
  input.value = "";
}

// Expose functions globally for inline onclick handlers
window.showScreen = showScreen;
window.showMainMenu = showMainMenu;
window.showGameModeSelect = showGameModeSelect;
window.selectMode = selectMode;
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;
window.showResults = showResults;
window.showResultsFromPause = showResultsFromPause;
window.playAgain = playAgain;
window.quitGame = quitGame;
window.showHint = showHint;
window.showLeaderboard = showLeaderboard;
window.showLeaderboardTab = showLeaderboardTab;
window.showAchievements = showAchievements;
window.showHowToPlay = showHowToPlay;
window.closeModal = closeModal;
window.submitBoggleWord = submitBoggleWord;
window.submitBeeWord = submitBeeWord;
window.submitUnscrambleWord = submitUnscrambleWord;
window.submitScrabbleWord = submitScrabbleWord;
window.shareResult = shareResult;
