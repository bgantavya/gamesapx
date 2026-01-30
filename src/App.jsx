import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import MemoryGame from './games/MemoryGame';
import TicTacToe from './games/TicTacToe';
import SnakeGame from './games/SnakeGame';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/games/memory" element={
            <ProtectedRoute>
              <MemoryGame />
            </ProtectedRoute>
          } />
          <Route path="/games/tictactoe" element={
            <ProtectedRoute>
              <TicTacToe />
            </ProtectedRoute>
          } />
          <Route path="/games/snake" element={
            <ProtectedRoute>
              <SnakeGame />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
