import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [loginMessage, setLoginMessage] = useState({ text: '', type: '' });
  const [registerMessage, setRegisterMessage] = useState({ text: '', type: '' });
  
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage({ text: '', type: '' });
    
    const result = await login(loginData.username, loginData.password);
    
    if (result.success) {
      setLoginMessage({ text: 'Login successful!', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 500);
    } else {
      setLoginMessage({ text: result.error, type: 'error' });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMessage({ text: '', type: '' });
    
    const result = await register(registerData.username, registerData.email, registerData.password);
    
    if (result.success) {
      setRegisterMessage({ text: 'Registration successful! Please login.', type: 'success' });
      setRegisterData({ username: '', email: '', password: '' });
      setTimeout(() => setActiveTab('login'), 1000);
    } else {
      setRegisterMessage({ text: result.error, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">🎮 GamesAPX</h1>
          <p className="text-gray-600">Multi-Game Platform</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Login
            </button>
            {loginMessage.text && (
              <div className={`p-3 rounded-lg text-center ${
                loginMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {loginMessage.text}
              </div>
            )}
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Register
            </button>
            {registerMessage.text && (
              <div className={`p-3 rounded-lg text-center ${
                registerMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {registerMessage.text}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
