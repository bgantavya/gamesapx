const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./gamesapx.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      thumbnail TEXT,
      file_path TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      game_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (game_id) REFERENCES games(id)
    )`);

    // Insert default admin user (username: admin, password: admin123)
    const adminHash = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password, email, is_admin) 
            VALUES ('admin', ?, 'admin@gamesapx.com', 1)`, [adminHash]);

    // Insert default games
    db.run(`INSERT OR IGNORE INTO games (name, description, thumbnail, file_path) 
            VALUES ('Tic-Tac-Toe', 'Classic Tic-Tac-Toe game', '/images/tictactoe.png', '/games/tictactoe.html')`);
    db.run(`INSERT OR IGNORE INTO games (name, description, thumbnail, file_path) 
            VALUES ('Snake', 'Classic Snake game', '/images/snake.png', '/games/snake.html')`);
    db.run(`INSERT OR IGNORE INTO games (name, description, thumbnail, file_path) 
            VALUES ('Memory Match', 'Memory card matching game', '/images/memory.png', '/games/memory.html')`);
    
    console.log('Database initialized successfully');
  });
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'gamesapx-secret-key-2024-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));
app.use(express.static('public'));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

function requireAdmin(req, res, next) {
  if (req.session.userId && req.session.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}

// User registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Registration failed. Username or email may already exist.' });
        }
        res.json({ message: 'Registration successful', userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAdmin = user.is_admin === 1;
      
      res.json({ 
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.is_admin === 1
        }
      });
    }
  );
});

// User logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
app.get('/api/user', requireAuth, (req, res) => {
  db.get(
    'SELECT id, username, email, is_admin FROM users WHERE id = ?',
    [req.session.userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin === 1
      });
    }
  );
});

// Get all games
app.get('/api/games', (req, res) => {
  db.all('SELECT * FROM games WHERE is_active = 1', [], (err, games) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch games' });
    }
    res.json(games);
  });
});

// Submit score
app.post('/api/scores', requireAuth, (req, res) => {
  const { gameId, score } = req.body;
  
  if (!gameId || score === undefined) {
    return res.status(400).json({ error: 'Game ID and score are required' });
  }

  db.run(
    'INSERT INTO scores (user_id, game_id, score) VALUES (?, ?, ?)',
    [req.session.userId, gameId, score],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to submit score' });
      }
      res.json({ message: 'Score submitted successfully', scoreId: this.lastID });
    }
  );
});

// Get leaderboard for a game
app.get('/api/leaderboard/:gameId', (req, res) => {
  const { gameId } = req.params;
  
  db.all(
    `SELECT u.username, s.score, s.created_at 
     FROM scores s 
     JOIN users u ON s.user_id = u.id 
     WHERE s.game_id = ? 
     ORDER BY s.score DESC 
     LIMIT 10`,
    [gameId],
    (err, scores) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch leaderboard' });
      }
      res.json(scores);
    }
  );
});

// Get user's scores
app.get('/api/user/scores', requireAuth, (req, res) => {
  db.all(
    `SELECT g.name as game_name, s.score, s.created_at 
     FROM scores s 
     JOIN games g ON s.game_id = g.id 
     WHERE s.user_id = ? 
     ORDER BY s.created_at DESC`,
    [req.session.userId],
    (err, scores) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch scores' });
      }
      res.json(scores);
    }
  );
});

// Admin: Add a new game
app.post('/api/admin/games', requireAdmin, (req, res) => {
  const { name, description, thumbnail, filePath } = req.body;
  
  if (!name || !filePath) {
    return res.status(400).json({ error: 'Name and file path are required' });
  }

  db.run(
    'INSERT INTO games (name, description, thumbnail, file_path) VALUES (?, ?, ?, ?)',
    [name, description, thumbnail, filePath],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Game already exists' });
        }
        return res.status(500).json({ error: 'Failed to add game' });
      }
      res.json({ message: 'Game added successfully', gameId: this.lastID });
    }
  );
});

// Admin: Remove/deactivate a game
app.delete('/api/admin/games/:gameId', requireAdmin, (req, res) => {
  const { gameId } = req.params;
  
  db.run(
    'UPDATE games SET is_active = 0 WHERE id = ?',
    [gameId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to remove game' });
      }
      res.json({ message: 'Game removed successfully' });
    }
  );
});

// Admin: Get all games (including inactive)
app.get('/api/admin/games', requireAdmin, (req, res) => {
  db.all('SELECT * FROM games', [], (err, games) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch games' });
    }
    res.json(games);
  });
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
