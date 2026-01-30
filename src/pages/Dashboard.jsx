import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const gameRoutes = {
    'Tic-Tac-Toe': '/games/tictactoe',
    'Snake': '/games/snake',
    'Memory Match': '/games/memory',
  };

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab]);

  const loadGames = async () => {
    try {
      const response = await fetch('/api/games');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const groupedLeaderboard = leaderboard.reduce((acc, entry) => {
    if (!acc[entry.game_name]) {
      acc[entry.game_name] = [];
    }
    acc[entry.game_name].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-indigo-600">🎮 GamesAPX</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Hi, {user?.username}!</span>
              {user?.isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 px-6 font-medium transition ${
                activeTab === 'games'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('games')}
            >
              Games
            </button>
            <button
              className={`flex-1 py-4 px-6 font-medium transition ${
                activeTab === 'leaderboard'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('leaderboard')}
            >
              Leaderboard
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'games' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => navigate(gameRoutes[game.name])}
                    className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all text-white text-left"
                  >
                    <div className="text-5xl mb-3">🎮</div>
                    <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                    <p className="text-indigo-100">{game.description || 'Click to play!'}</p>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                {Object.entries(groupedLeaderboard).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No scores yet. Start playing!</p>
                ) : (
                  Object.entries(groupedLeaderboard).map(([gameName, scores]) => (
                    <div key={gameName} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">{gameName}</h3>
                      <div className="space-y-2">
                        {scores.slice(0, 10).map((entry, index) => (
                          <div
                            key={index}
                            className={`flex justify-between items-center p-3 rounded-lg ${
                              entry.username === user?.username
                                ? 'bg-indigo-100 border-2 border-indigo-500'
                                : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-bold text-lg w-8 ${
                                  index === 0
                                    ? 'text-yellow-500'
                                    : index === 1
                                    ? 'text-gray-400'
                                    : index === 2
                                    ? 'text-orange-600'
                                    : 'text-gray-600'
                                }`}
                              >
                                #{index + 1}
                              </span>
                              <span className="font-medium text-gray-800">{entry.username}</span>
                            </div>
                            <span className="font-bold text-indigo-600">{entry.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
