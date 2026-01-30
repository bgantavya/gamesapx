import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TicTacToe = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState(Array(9).fill(''));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const w = calculateWinner(newBoard);
    if (w) {
      setWinner(w);
      setGameOver(true);
      submitScore(w === 'X' ? 100 : 0);
    } else if (newBoard.every((sq) => sq)) {
      setGameOver(true);
      submitScore(50);
    }

    setIsXNext(!isXNext);
  };

  const submitScore = async (score) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: 1, score }),
      });
      if (response.ok) {
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        console.error('Failed to submit score');
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
    setSubmitting(false);
  };

  const w = calculateWinner(board);
  const isBoardFull = board.every((sq) => sq);
  let status = w
    ? `Winner: ${w} 🎉`
    : isBoardFull
    ? "It's a Draw!"
    : `Player: ${isXNext ? 'X' : 'O'}`;

  const renderSquare = (index) => (
    <button
      onClick={() => handleClick(index)}
      className={`w-24 h-24 border-2 border-indigo-500 rounded-lg font-bold text-3xl transition ${
        board[index] === 'X'
          ? 'bg-indigo-100 text-indigo-600'
          : board[index] === 'O'
          ? 'bg-purple-100 text-purple-600'
          : 'bg-white hover:bg-gray-50'
      }`}
    >
      {board[index]}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-600">🎮 Tic-Tac-Toe</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Exit
            </button>
          </div>

          <div className="text-center mb-8">
            <p className={`text-xl font-bold ${w ? 'text-green-600' : 'text-gray-700'}`}>
              {status}
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => renderSquare(i))}
            </div>
          </div>

          <button
            onClick={resetGame}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            New Game
          </button>

          {gameOver && (
            <div className="mt-4 text-center text-sm text-gray-600">
              {submitting ? 'Score submitted! Returning...' : 'Redirecting to dashboard...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
