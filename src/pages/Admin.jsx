import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const [games, setGames] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', filePath: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const response = await fetch('/api/admin/games');
      setGames(await response.json());
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          file_path: formData.filePath,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Game added!', type: 'success' });
        setFormData({ name: '', description: '', filePath: '' });
        loadGames();
      } else {
        setMessage({ text: data.error || 'Failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed', type: 'error' });
    }
  };

  const handleToggleActive = async (gameId, currentStatus) => {
    try {
      await fetch(`/api/admin/games/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: currentStatus ? 0 : 1 }),
      });
      loadGames();
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const handleDelete = async (gameId) => {
    if (!window.confirm('Delete this game?')) return;
    try {
      await fetch(`/api/admin/games/${gameId}`, { method: 'DELETE' });
      loadGames();
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-indigo-600">⚙️ Admin</h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Game</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Game Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="2"
            />
            <input
              type="text"
              placeholder="File Path"
              value={formData.filePath}
              onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Add Game
            </button>
          </form>
          {message.text && (
            <div className={`mt-4 p-3 rounded-lg text-center ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Games</h2>
          <div className="space-y-3">
            {games.map((game) => (
              <div key={game.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{game.name}</h3>
                  <p className="text-sm text-gray-600">{game.description}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-medium ${
                    game.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {game.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(game.id, game.is_active)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                  >
                    {game.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(game.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
