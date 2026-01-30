# GamesAPX - Multi-Game Web Platform

A comprehensive web-based platform that hosts multiple casual games, allowing users to play, track scores, and manage profiles.

## Features

- **User Authentication**: Registration and login system with secure password hashing
- **Multiple Games**: Integrated games including Tic-Tac-Toe, Snake, and Memory Match
- **Score Tracking**: Automatic score submission and persistent storage
- **Leaderboards**: View top scores for each game
- **User Dashboard**: Game selection interface with user profile and score history
- **Admin Panel**: Control panel for adding or removing games

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: bcrypt for password hashing, express-session for session management
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

## Installation

1. Clone the repository:
```bash
git clone https://github.com/bgantavya/gamesapx.git
cd gamesapx
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set environment variables for production:
```bash
export SESSION_SECRET="your-secure-random-secret-key"
export NODE_ENV="production"
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Default Admin Account

- **Username**: admin
- **Password**: admin123

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current user info

### Games
- `GET /api/games` - Get all active games
- `POST /api/admin/games` - Add a new game (Admin only)
- `DELETE /api/admin/games/:gameId` - Remove a game (Admin only)
- `GET /api/admin/games` - Get all games including inactive (Admin only)

### Scores
- `POST /api/scores` - Submit a score
- `GET /api/leaderboard/:gameId` - Get leaderboard for a game
- `GET /api/user/scores` - Get current user's scores

## Project Structure

```
gamesapx/
├── server.js              # Express server and API endpoints
├── package.json           # Node.js dependencies
├── public/                # Static files
│   ├── index.html         # Login/Registration page
│   ├── dashboard.html     # User dashboard
│   ├── admin.html         # Admin panel
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   ├── js/
│   │   ├── auth.js        # Authentication logic
│   │   ├── dashboard.js   # Dashboard logic
│   │   └── admin.js       # Admin panel logic
│   └── games/
│       ├── tictactoe.html # Tic-Tac-Toe game
│       ├── snake.html     # Snake game
│       └── memory.html    # Memory Match game
└── gamesapx.db           # SQLite database (auto-generated)
```

## Usage

1. **Register**: Create a new account on the home page (minimum 8 characters for password)
2. **Login**: Use your credentials to access the dashboard
3. **Play Games**: Click on any game card to start playing
4. **View Scores**: Navigate to "My Scores" tab to see your game history
5. **Admin**: Login as admin to add or remove games

## Security Notes

- **Session Secret**: Change the default session secret in production by setting the `SESSION_SECRET` environment variable
- **Password Requirements**: Passwords must be at least 8 characters long
- **HTTPS**: Enable HTTPS in production for secure cookie transmission
- **Admin Access**: Change the default admin password immediately after deployment

## License

MIT License