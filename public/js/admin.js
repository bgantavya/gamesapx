let currentUser = null;

// Check authentication and admin access
async function checkAuth() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            currentUser = await response.json();
            if (!currentUser.isAdmin) {
                alert('Admin access required');
                window.location.href = '/dashboard';
                return;
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

// Add new game
document.getElementById('addGameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('game-name').value;
    const description = document.getElementById('game-description').value;
    const thumbnail = document.getElementById('game-thumbnail').value;
    const filePath = document.getElementById('game-filepath').value;
    
    try {
        const response = await fetch('/api/admin/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, thumbnail, filePath })
        });
        
        const data = await response.json();
        const messageDiv = document.getElementById('add-game-message');
        
        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Game added successfully!';
            document.getElementById('addGameForm').reset();
            loadGames();
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.error || 'Failed to add game';
        }
    } catch (error) {
        const messageDiv = document.getElementById('add-game-message');
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Failed to add game. Please try again.';
    }
});

// Load all games
async function loadGames() {
    try {
        const response = await fetch('/api/admin/games');
        const games = await response.json();
        
        const gamesList = document.getElementById('admin-games-list');
        gamesList.innerHTML = '';
        
        games.forEach(game => {
            const gameItem = document.createElement('div');
            gameItem.className = 'game-item' + (game.is_active ? '' : ' inactive');
            gameItem.innerHTML = `
                <div class="game-item-info">
                    <h3>${game.name}</h3>
                    <p>${game.description || 'No description'}</p>
                    <p><em>${game.file_path}</em></p>
                    <p>Status: ${game.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <div class="game-item-actions">
                    ${game.is_active ? `<button class="btn-danger" onclick="removeGame(${game.id})">Remove</button>` : '<span>Removed</span>'}
                </div>
            `;
            gamesList.appendChild(gameItem);
        });
    } catch (error) {
        console.error('Failed to load games:', error);
    }
}

// Remove game
async function removeGame(gameId) {
    if (!confirm('Are you sure you want to remove this game?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/games/${gameId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadGames();
        } else {
            alert('Failed to remove game');
        }
    } catch (error) {
        console.error('Failed to remove game:', error);
        alert('Failed to remove game');
    }
}

// Initialize
checkAuth();
