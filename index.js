const clickButton = document.getElementById('clickButton');
const restartButton = document.getElementById('restartButton');
const clicksDisplay = document.getElementById('clicks');
const timerDisplay = document.getElementById('timer');
const saveScoreDiv = document.getElementById('saveScoreDiv');
const playerRankDisplay = document.getElementById('playerRank');
const playerNameInput = document.getElementById('playerName');
const saveButton = document.getElementById('saveButton');
const leaderboard = document.getElementById('leaderboard');
const confirmationModal = document.getElementById('confirmationModal');

let clickCount = 0;
let timeLeft = 5000; // 5 seconds
let isGameRunning = false;
let timerInterval;

const baseURL = 'http://localhost:3000';
const myFetch = async (endpoint, options) => {
    return await fetch(baseURL + endpoint, options);
};
// Show error modal or alert
const showError = (message) => {
    const modal = document.getElementById('errorModal');
    if (modal) {
        modal.querySelector('.modal-content h2').textContent = message;
        modal.style.display = 'flex';
    } else {
        alert(message); // Fallback to alert if no modal exists
    }
};

// Close error modal
document.getElementById('closeErrorModal')?.addEventListener('click', () => {
    document.getElementById('errorModal').style.display = 'none';
});


// Fetch and display leaderboard
const fetchLeaderboard = async () => {
    try {
        const response = await myFetch('/api/top-players');
        const players = await response.json();

        leaderboard.innerHTML = players.map((player, index) => `
            <li>
                <span class="rank">${index + 1}</span>
                <span class="name">${player.name}</span>
                <span class="score">Score: ${player.score}</span>
            </li>
        `).join('');
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
};

// Fetch player's rank
const fetchRank = async (score) => {
    try {
        const response = await myFetch(`/api/rank?score=${score}`);
        const { rank } = await response.json();
        playerRankDisplay.textContent = rank;
    } catch (error) {
        console.error('Error fetching rank:', error);
    }
};

// Save player's score
// Save player's score
const saveScore = async () => {
    const name = playerNameInput.value.trim();
    if (!name) {
        showError('Please enter your name!');
        return;
    }

    try {
        const response = await myFetch('/api/save-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, score: clickCount }),
        });

        const data = await response.json();

        if (response.ok) {
            showConfirmation('Your score has been saved!');
            setTimeout(() => {
                confirmationModal.style.display = 'none';
                saveScoreDiv.style.display = 'none';
            }
                , 2000);
            fetchLeaderboard(); // Update leaderboard after saving
        } else {
            showError(data.message || 'Failed to save score. Try again.');
        }
    } catch (error) {
        console.error('Error saving score:', error);
        showError('An error occurred. Please try again.');
    }
};


// Show confirmation modal
const showConfirmation = (message) => {
    confirmationModal.querySelector('.modal-content h2').textContent = message;
    confirmationModal.style.display = 'flex';
};

// Close confirmation modal
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('confirmationModal').style.display = 'none';
});

// Start the game
const startGame = () => {
    if (isGameRunning) return;

    isGameRunning = true;
    clickCount = 0;
    timeLeft = 5000;

    clicksDisplay.textContent = `Clicks: ${clickCount}`;
    timerDisplay.textContent = `Time Left: ${(timeLeft / 1000).toFixed(3)}s`;
    restartButton.style.display = 'none';
    saveScoreDiv.style.display = 'none';

    timerInterval = setInterval(() => {
        timeLeft -= 10;
        timerDisplay.textContent = `Time Left: ${(timeLeft / 1000).toFixed(3)}s`;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 10);
};

// End the game
const endGame = () => {
    isGameRunning = false;
    clearInterval(timerInterval);
    timerDisplay.textContent = 'Time is up!';
    restartButton.style.display = 'block';
    saveScoreDiv.style.display = 'block';
    fetchRank(clickCount);
    clickButton.disabled = true;
    clickButton.style.cursor = 'not-allowed';
};

// Button click to count clicks
clickButton.addEventListener('click', () => {
    if (!isGameRunning) {
        startGame();
    }

    if (isGameRunning) {
        clickCount++;
        clicksDisplay.textContent = `Clicks: ${clickCount}`;
    }
});

// Restart the game
restartButton.addEventListener('click', startGame);

// Save score button
saveButton.addEventListener('click', saveScore);

// Fetch leaderboard on page load
window.onload = fetchLeaderboard;
