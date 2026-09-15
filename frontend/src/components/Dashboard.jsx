import { useState, useEffect } from 'react';
import api from '../utils/api';
import Sidebar from './Sidebar';
import Chat from './Chat';
import { useChat } from '../hooks/useChat';

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/tasks').then(({ data }) => setTasks(data)).catch(console.error);
    api.get('/auth/users').then(({ data }) => setUsers(data)).catch(console.error);
  }, []);

  const { messages, send } = useChat({ tasks, setTasks, users, user });

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-left">
          <span className="logo-icon">💬</span>
          <span className="logo-text">TaskChat</span>
        </div>
        <div className="topbar-right">
          <div className="user-pill">
            <div className="user-badge">{user.name[0].toUpperCase()}</div>
            <span className="user-name">{user.name}</span>
          </div>
          <button className="btn-logout" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="layout">
        <Sidebar tasks={tasks} user={user} onTasksUpdate={setTasks} />
        <Chat messages={messages} onSend={send} user={user} />
      </div>
    </div>
  );
}
