let currentUser = null;

// Check authentication and load user data
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            currentUser = await response.json();
            document.getElementById('username-display').textContent = `Welcome, ${currentUser.username}!`;
            
            if (currentUser.isAdmin) {
                document.getElementById('admin-tab').style.display = 'block';
            }
            
            loadGames();
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        window.location.href = '/';
    }
}

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout failed:', error);
    }
});

// Tab navigation
document.getElementById('games-tab').addEventListener('click', () => {
    showSection('games');
});

document.getElementById('scores-tab').addEventListener('click', () => {
    showSection('scores');
    loadUserScores();
});

document.getElementById('admin-tab').addEventListener('click', () => {
    window.location.href = '/admin';
});

function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    if (section === 'games') {
        document.getElementById('games-section').style.display = 'block';
        document.getElementById('games-tab').classList.add('active');
    } else if (section === 'scores') {
        document.getElementById('scores-section').style.display = 'block';
        document.getElementById('scores-tab').classList.add('active');
    }
}

// Load available games
async function loadGames() {
    try {
        const response = await fetch('/api/games');
        const games = await response.json();
        
        const gamesGrid = document.getElementById('games-grid');
        gamesGrid.innerHTML = '';
        
        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <div class="game-thumbnail">🎮</div>
                <h3>${game.name}</h3>
                <p>${game.description || 'Click to play!'}</p>
            `;
            gameCard.addEventListener('click', () => {
                window.open(game.file_path, '_blank');
            });
            gamesGrid.appendChild(gameCard);
        });
    } catch (error) {
        console.error('Failed to load games:', error);
    }
}

// Load user scores
async function loadUserScores() {
    try {
        const response = await fetch('/api/user/scores');
        const scores = await response.json();
        
        const scoresList = document.getElementById('scores-list');
        scoresList.innerHTML = '';
        
        if (scores.length === 0) {
            scoresList.innerHTML = '<p>No scores yet. Start playing games!</p>';
            return;
        }
        
        scores.forEach(score => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            scoreItem.innerHTML = `
                <div>
                    <strong>${score.game_name}</strong>
                    <p>${new Date(score.created_at).toLocaleString()}</p>
                </div>
                <div class="score-display">${score.score}</div>
            `;
            scoresList.appendChild(scoreItem);
        });
    } catch (error) {
        console.error('Failed to load scores:', error);
    }
}

// Initialize
checkAuth();
