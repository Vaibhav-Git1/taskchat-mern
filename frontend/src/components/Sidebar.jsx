import { useState } from 'react';
import TaskCard from './TaskCard';
import api from '../utils/api';

const FILTERS = [
  ['all', 'All'],
  ['mine', 'Created'],
  ['assigned', 'Assigned'],
  ['pending', 'Pending'],
  ['done', 'Done'],
];

export default function Sidebar({ tasks, user, onTasksUpdate }) {
  const [active, setActive] = useState('all');
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);

  const filtered = tasks.filter((t) => {
    if (active === 'mine') return t.assignedBy?._id === user.id;
    if (active === 'assigned') return t.assignedTo?._id === user.id;
    if (active === 'pending') return t.status === 'Pending';
    if (active === 'done') return t.status === 'Completed';
    return true;
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    try {
      const { data } = await api.get(`/tasks/search?q=${encodeURIComponent(q)}`);
      onTasksUpdate(data);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = async () => {
    setQ('');
    const { data } = await api.get('/tasks');
    onTasksUpdate(data);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h2 className="sidebar-title">Tasks</h2>
        <span className="count-pill">{tasks.length}</span>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search tasks..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button type="button" className="clear-btn" onClick={clearSearch}>✕</button>
        )}
        <button type="submit" className="search-submit" disabled={searching}>
          {searching ? '…' : '⌕'}
        </button>
      </form>

      <div className="filter-row">
        {FILTERS.map(([k, l]) => (
          <button
            key={k}
            className={`ftab ${active === k ? 'ftab-active' : ''}`}
            onClick={() => setActive(k)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="task-scroll">
        {filtered.length === 0 ? (
          <div className="empty-hint">
            <div className="empty-icon">📋</div>
            <p>No tasks here</p>
            <small>Try "create task" in the chat</small>
          </div>
        ) : (
          filtered.map((t) => (
            <TaskCard key={t._id} task={t} currentUser={user} />
          ))
        )}
      </div>
    </aside>
  );
}
