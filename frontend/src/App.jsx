import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');

  useEffect(() => {
    const saved = localStorage.getItem('taskchat_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleAuth = (userData, token) => {
    localStorage.setItem('taskchat_user', JSON.stringify(userData));
    localStorage.setItem('taskchat_token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('taskchat_user');
    localStorage.removeItem('taskchat_token');
    setUser(null);
    setPage('login');
  };

  if (user) return <Dashboard user={user} onLogout={handleLogout} />;

  return page === 'login'
    ? <Login onLogin={handleAuth} onSwitch={() => setPage('register')} />
    : <Register onRegister={handleAuth} onSwitch={() => setPage('login')} />;
}
