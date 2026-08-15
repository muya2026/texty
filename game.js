// Game State
const gameState = {
    currentLevel: 0,
    score: 0,
    timeLeft: 60,
    timerInterval: null,
    powerUps: {
        hint: 3,
        time: 2,
        skip: 1
    },
    achievements: [],
    levelStartTime: 0
};

// Unique Puzzle Types with Cyber Theme
const puzzles = [
    {
        type: 'binary',
        title: 'Binary Decryption',
        text: 'The neural gate requires a binary key. Convert this binary sequence to decimal:<br><br><span style="color: #00f3ff; font-size: 1.5rem;">101101</span>',
        answer: '45',
        hint: 'Each position represents a power of 2, starting from the right (2^0, 2^1, 2^2...)',
        difficulty: 1
    },
    {
        type: 'caesar',
        title: 'Caesar Cipher',
        text: 'A message from the past encrypted with shift +3:<br><br><span style="color: #ff00ff; font-size: 1.5rem;">WKH TXLFN EURZQ IRA</span><br><br>Decrypt it (shift back by 3).',
        answer: 'THE QUICK BROWN FOX',
        hint: 'Each letter was shifted forward by 3. A becomes D, B becomes E...',
        difficulty: 2
    },
    {
        type: 'sequence',
        title: 'Neural Sequence',
        text: 'Complete the neural pattern:<br><br><span style="color: #00ff88; font-size: 1.5rem;">2, 6, 12, 20, 30, ?</span>',
        answer: '42',
        hint: 'Look at the differences between consecutive numbers: 4, 6, 8, 10...',
        difficulty: 2
    },
    {
        type: 'anagram',
        title: 'Code Anagram',
        text: 'Unscramble these letters to reveal a programming concept:<br><br><span style="color: #bd00ff; font-size: 1.5rem;">R I T E A V I C U R S E</span>',
        answer: 'RECURSIVE',
        hint: 'It\'s when a function calls itself',
        difficulty: 3
    },
    {
        type: 'hex',
        title: 'Hexadecimal Gateway',
        text: 'The hex lock shows <span style="color: #00f3ff; font-size: 1.5rem;">2F</span>. What is this in decimal?',
        answer: '47',
        hint: 'In hex: 2×16 + F(15) = ?',
        difficulty: 2
    },
    {
        type: 'logic',
        title: 'AI Logic Gate',
        text: 'Three AI nodes make statements:<br>• Node A: "Node B is lying"<br>• Node B: "Node C is lying"<br>• Node C: "Both A and B are lying"<br><br>Which node tells the truth? (Enter A, B, or C)',
        answer: 'B',
        hint: 'If C were true, then C would be lying. If A were true, B would be lying, making C true...',
        difficulty: 4
    },
    {
        type: 'math',
        title: 'Quantum Calculation',
        text: 'Solve the quantum equation:<br><br><span style="color: #00ff88; font-size: 1.5rem;">7² - 3³ + √81</span>',
        answer: '49',
        hint: '7²=49, 3³=27, √81=9. So: 49 - 27 + 9 = ?',
        difficulty: 3
    },
    {
        type: 'word',
        title: 'Cyber Vocabulary',
        text: 'I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?',
        answer: 'ECHO',
        hint: 'Think about sound reflection in digital spaces',
        difficulty: 2
    },
    {
        type: 'pattern',
        title: 'Matrix Pattern',
        text: 'Find the missing number in the matrix:<br><br><table style="margin: 1rem auto; border-collapse: collapse;"><tr><td style="border: 1px solid #00f3ff; padding: 10px; color: #00f3ff;">3</td><td style="border: 1px solid #00f3ff; padding: 10px; color: #00f3ff;">7</td><td style="border: 1px solid #00f3ff; padding: 10px; color: #00f3ff;">16</td></tr><tr><td style="border: 1px solid #00f3ff; padding: 10px; color: #00f3ff;">5</td><td style="border: 1px solid #00f3ff; padding: 10px; color: #00f3ff;">9</td><td style="border: 1px solid #00f3ff; padding: 10px; color: #00f3ff;">20</td></tr><tr><td style="border: 1px solid #00f3ff; padding: 10px; color: #00f3ff;">4</td><td style="border: 1px solid #00f3ff; padding: 10px; color: #00f3ff;">8</td><td style="border: 1px solid #ff00ff; padding: 10px;">?</td></tr></table>',
        answer: '18',
        hint: 'Third column = (first + second) × 2',
        difficulty: 4
    },
    {
        type: 'riddle',
        title: 'The Oracle\'s Riddle',
        text: 'The more you take away, the larger I become. What am I?',
        answer: 'HOLE',
        hint: 'Think physically - removing material creates space',
        difficulty: 2
    },
    {
        type: 'code',
        title: 'Code Breaking',
        text: 'If CODE = 3-15-4-5 and GAME = 7-1-13-5, what does HACK equal?',
        answer: '8-1-3-11',
        hint: 'Each letter corresponds to its position in the alphabet (A=1, B=2, etc.)',
        difficulty: 3
    },
    {
        type: 'fibonacci',
        title: 'Fibonacci Core',
        text: 'The Fibonacci core is destabilizing! Complete the sequence:<br><br><span style="color: #bd00ff; font-size: 1.5rem;">1, 1, 2, 3, 5, 8, 13, ?</span>',
        answer: '21',
        hint: 'Each number is the sum of the two preceding ones',
        difficulty: 1
    }
];

// Achievement Definitions
const achievementDefinitions = [
    { id: 'first_blood', name: 'First Decrypt', description: 'Complete your first puzzle', icon: '🏆' },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Solve a puzzle in under 10 seconds', icon: '⚡' },
    { id: 'perfectionist', name: 'Perfectionist', description: 'Complete 5 levels without using hints', icon: '💎' },
    { id: 'scholar', name: 'Cyber Scholar', description: 'Reach level 5', icon: '📚' },
    { id: 'master', name: 'Grid Master', description: 'Complete all 12 levels', icon: '👑' },
    { id: 'power_user', name: 'Power User', description: 'Use all three types of power-ups', icon: '🔋' }
];

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');
const puzzleContent = document.getElementById('puzzle-content');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const feedback = document.getElementById('feedback');
const levelDisplay = document.getElementById('level-display');
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const levelProgress = document.getElementById('level-progress');
const levelModal = document.getElementById('level-modal');
const gameoverModal = document.getElementById('gameover-modal');
const nextLevelBtn = document.getElementById('next-level-btn');
const restartBtn = document.getElementById('restart-btn');
const achievementsList = document.getElementById('achievements-list');

// Initialize Game
startBtn.addEventListener('click', () => {
    loadingScreen.classList.remove('active');
    gameScreen.classList.add('active');
    startGame();
});

function startGame() {
    gameState.currentLevel = 0;
    gameState.score = 0;
    gameState.powerUps = { hint: 3, time: 2, skip: 1 };
    gameState.achievements = [];
    updateUI();
    renderAchievements();
    loadLevel();
}

function loadLevel() {
    if (gameState.currentLevel >= puzzles.length) {
        showGameOver(true);
        return;
    }
    
    const puzzle = puzzles[gameState.currentLevel];
    puzzleContent.innerHTML = `
        <h2 class="puzzle-title">${puzzle.title}</h2>
        <p class="puzzle-text">${puzzle.text}</p>
        <p class="puzzle-hint">💡 Difficulty: ${'★'.repeat(puzzle.difficulty)}${'☆'.repeat(5-puzzle.difficulty)}</p>
    `;
    
    answerInput.value = '';
    feedback.className = 'feedback';
    feedback.textContent = '';
    gameState.timeLeft = 60;
    gameState.levelStartTime = Date.now();
    
    updateTimerDisplay();
    startTimer();
    updateUI();
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            showFeedback('TIME EXPIRED - SYSTEM RESET', 'error');
            setTimeout(() => {
                showGameOver(false);
            }, 2000);
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerDisplay.textContent = gameState.timeLeft;
    if (gameState.timeLeft <= 10) {
        timerDisplay.style.color = '#ff4444';
        timerDisplay.style.textShadow = '0 0 20px #ff4444';
    } else {
        timerDisplay.style.color = '#00ff88';
        timerDisplay.style.textShadow = '0 0 10px #00ff88';
    }
}

function checkAnswer() {
    const userAnswer = answerInput.value.trim().toUpperCase();
    const puzzle = puzzles[gameState.currentLevel];
    
    if (userAnswer === puzzle.answer) {
        const timeTaken = (Date.now() - gameState.levelStartTime) / 1000;
        const baseScore = 100 * puzzle.difficulty;
        const timeBonus = Math.max(0, Math.floor((60 - timeTaken) * 2));
        const levelScore = baseScore + timeBonus;
        
        gameState.score += levelScore;
        
        // Check for speed demon achievement
        if (timeTaken < 10 && !hasAchievement('speed_demon')) {
            unlockAchievement('speed_demon');
        }
        
        showFeedback(`DECRYPTION SUCCESSFUL! +${levelScore} POINTS`, 'success');
        clearInterval(gameState.timerInterval);
        
        setTimeout(() => {
            showLevelComplete(levelScore, timeTaken);
        }, 1500);
    } else {
        showFeedback('DECRYPTION FAILED - TRY AGAIN', 'error');
        answerInput.value = '';
        answerInput.focus();
    }
}

function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
}

function showLevelComplete(score, time) {
    document.getElementById('level-score').textContent = score;
    document.getElementById('level-time').textContent = time.toFixed(1) + 's';
    
    // Calculate stars
    let stars = '★';
    if (time < 20) stars = '★★★';
    else if (time < 40) stars = '★★';
    document.getElementById('level-stars').textContent = stars;
    
    levelModal.classList.add('active');
    
    // Check achievements
    if (gameState.currentLevel === 0 && !hasAchievement('first_blood')) {
        unlockAchievement('first_blood');
    }
    if (gameState.currentLevel === 4 && !hasAchievement('scholar')) {
        unlockAchievement('scholar');
    }
    if (gameState.currentLevel === puzzles.length - 1 && !hasAchievement('master')) {
        unlockAchievement('master');
    }
}

function nextLevel() {
    gameState.currentLevel++;
    levelModal.classList.remove('active');
    
    // Update progress bar
    const progress = ((gameState.currentLevel) / puzzles.length) * 100;
    levelProgress.style.width = `${progress}%`;
    
    loadLevel();
    updateUI();
}

function showGameOver(victory) {
    clearInterval(gameState.timerInterval);
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-levels').textContent = gameState.currentLevel;
    document.getElementById('final-achievements').textContent = gameState.achievements.length;
    
    const modalTitle = gameoverModal.querySelector('.modal-title');
    if (victory) {
        modalTitle.textContent = 'SYSTEM OVERRIDE - VICTORY';
        modalTitle.classList.remove('game-over');
    } else {
        modalTitle.textContent = 'SYSTEM FAILURE';
        modalTitle.classList.add('game-over');
    }
    
    gameoverModal.classList.add('active');
}

function restartGame() {
    gameoverModal.classList.remove('active');
    startGame();
}

// Power-ups
function usePowerUp(type) {
    if (gameState.powerUps[type] <= 0) {
        showFeedback('POWER-UP DEPLETED', 'error');
        return;
    }
    
    gameState.powerUps[type]--;
    updateUI();
    
    const puzzle = puzzles[gameState.currentLevel];
    
    switch(type) {
        case 'hint':
            showFeedback(`HINT: ${puzzle.hint}`, 'success');
            break;
        case 'time':
            gameState.timeLeft += 30;
            updateTimerDisplay();
            showFeedback('+30 SECONDS ADDED', 'success');
            break;
        case 'skip':
            clearInterval(gameState.timerInterval);
            gameState.score += 50; // Partial points for skip
            showFeedback('LEVEL SKIPPED - PARTIAL CREDIT', 'success');
            setTimeout(() => {
                gameState.currentLevel++;
                levelModal.classList.remove('active');
                loadLevel();
                updateUI();
            }, 1500);
            break;
    }
    
    // Check power_user achievement
    const usedTypes = Object.keys(gameState.powerUps).filter(key => 
        gameState.powerUps[key] < (key === 'hint' ? 3 : key === 'time' ? 2 : 1)
    );
    if (usedTypes.length === 3 && !hasAchievement('power_user')) {
        unlockAchievement('power_user');
    }
}

// Achievements
function unlockAchievement(id) {
    if (!gameState.achievements.includes(id)) {
        gameState.achievements.push(id);
        const achievement = achievementDefinitions.find(a => a.id === id);
        showFeedback(`ACHIEVEMENT UNLOCKED: ${achievement.name}`, 'success');
        renderAchievements();
    }
}

function hasAchievement(id) {
    return gameState.achievements.includes(id);
}

function renderAchievements() {
    achievementsList.innerHTML = achievementDefinitions.map(ach => `
        <div class="achievement ${hasAchievement(ach.id) ? 'unlocked' : ''}">
            <span class="achievement-icon">${ach.icon}</span>
            <span>${ach.name}</span>
        </div>
    `).join('');
}

function updateUI() {
    levelDisplay.textContent = gameState.currentLevel + 1;
    scoreDisplay.textContent = gameState.score;
    
    document.getElementById('hint-count').textContent = gameState.powerUps.hint;
    document.getElementById('time-count').textContent = gameState.powerUps.time;
    document.getElementById('skip-count').textContent = gameState.powerUps.skip;
    
    renderAchievements();
}

// Event Listeners
submitBtn.addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

nextLevelBtn.addEventListener('click', nextLevel);
restartBtn.addEventListener('click', restartGame);

// Make usePowerUp available globally for onclick handlers
window.usePowerUp = usePowerUp;

// Add some ambient sound effects (optional, commented out for now)
// Could add audio for: correct answer, wrong answer, level complete, achievement unlock
