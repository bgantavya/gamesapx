import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SnakeGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const gridSize = 20;
  const tileCount = 20;
  const gameStateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    dx: 1,
    dy: 0,
    score: 0,
  });

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameActive) return;
      const key = e.keyCode;
      if (key === 37 && gameStateRef.current.dx === 0) {
        gameStateRef.current.dx = -1;
        gameStateRef.current.dy = 0;
      } else if (key === 38 && gameStateRef.current.dy === 0) {
        gameStateRef.current.dx = 0;
        gameStateRef.current.dy = -1;
      } else if (key === 39 && gameStateRef.current.dx === 0) {
        gameStateRef.current.dx = 1;
        gameStateRef.current.dy = 0;
      } else if (key === 40 && gameStateRef.current.dy === 0) {
        gameStateRef.current.dx = 0;
        gameStateRef.current.dy = 1;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(updateGame, 100);
    return () => clearInterval(interval);
  }, [gameActive]);

  const updateGame = () => {
    const state = gameStateRef.current;
    const head = { x: state.snake[0].x + state.dx, y: state.snake[0].y + state.dy };

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      endGame();
      return;
    }

    // Self collision
    if (state.snake.some((s) => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }

    state.snake.unshift(head);

    // Food collision
    if (head.x === state.food.x && head.y === state.food.y) {
      state.score += 10;
      setScore(state.score);
      generateFood();
    } else {
      state.snake.pop();
    }

    draw();
  };

  const generateFood = () => {
    const state = gameStateRef.current;
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      };
    } while (state.snake.some((s) => s.x === newFood.x && s.y === newFood.y));
    state.food = newFood;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = '#667eea';
    state.snake.forEach((segment) => {
      ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(state.food.x * gridSize + 1, state.food.y * gridSize + 1, gridSize - 2, gridSize - 2);
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    const finalScore = gameStateRef.current.score;
    if (finalScore > highScore) setHighScore(finalScore);
    submitScore(finalScore);
  };

  const submitScore = async (finalScore) => {
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: 2, score: finalScore }),
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

  const startGame = () => {
    gameStateRef.current = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 15, y: 15 },
      dx: 1,
      dy: 0,
      score: 0,
    };
    setScore(0);
    setGameOver(false);
    setGameActive(true);
    draw();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-600">🐍 Snake</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Exit
            </button>
          </div>

          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm">Score</p>
              <p className="text-3xl font-bold text-indigo-600">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">High Score</p>
              <p className="text-3xl font-bold text-purple-600">{highScore}</p>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="border-2 border-indigo-500 rounded-lg bg-gray-50"
            />
          </div>

          <p className="text-center text-gray-600 text-sm mb-4">Use arrow keys to control</p>

          {gameOver ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-100 rounded-lg text-center">
                <p className="text-red-700 font-bold">Game Over!</p>
                <p className="text-red-600">Final Score: {score}</p>
              </div>
              <button
                onClick={startGame}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <button
              onClick={startGame}
              disabled={gameActive}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {gameActive ? 'Game Running...' : 'Start Game'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
