import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MemoryGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎹'];

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (matched.length === 16) {
      setGameWon(true);
    }
  }, [matched]);

  const initGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  };

  const handleCardClick = (id) => {
    if (flipped.includes(id) || matched.includes(id) || flipped.length === 2) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setMoves(moves + 1);
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const submitScore = async () => {
    setSubmitting(true);
    const score = Math.max(0, 1000 - moves * 10);
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: 3, score }),
      });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Failed to submit score:', error);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-600">🧠 Memory Match</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Exit
            </button>
          </div>

          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Moves</p>
              <p className="text-3xl font-bold text-indigo-600">{moves}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Matched</p>
              <p className="text-3xl font-bold text-indigo-600">{matched.length / 2}/8</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Score</p>
              <p className="text-3xl font-bold text-indigo-600">{Math.max(0, 1000 - moves * 10)}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6 w-fit mx-auto">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`w-20 h-20 rounded-lg font-bold text-2xl transition-all ${
                  matched.includes(card.id)
                    ? 'bg-green-200 text-gray-600 cursor-default'
                    : flipped.includes(card.id)
                    ? 'bg-white text-gray-800 border-2 border-indigo-500'
                    : 'bg-indigo-500 text-transparent hover:bg-indigo-600'
                }`}
              >
                {matched.includes(card.id) || flipped.includes(card.id) ? card.emoji : '?'}
              </button>
            ))}
          </div>

          {gameWon ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-100 rounded-lg">
                <p className="text-green-700 font-bold text-lg">🎉 You Won!</p>
                <p className="text-green-600">Score: {Math.max(0, 1000 - moves * 10)}</p>
              </div>
              <button
                onClick={submitScore}
                disabled={submitting}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Score'}
              </button>
            </div>
          ) : (
            <button
              onClick={initGame}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              New Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
