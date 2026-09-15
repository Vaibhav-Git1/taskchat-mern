import { useState, useRef, useEffect } from 'react';
import TaskCard from './TaskCard';

const QUICK = ['create task', 'show tasks', 'update status', 'help'];

export default function Chat({ messages, onSend, user }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    onSend(val);
    setInput('');
    inputRef.current?.focus();
  };

  const handleQuick = (cmd) => {
    onSend(cmd);
    inputRef.current?.focus();
  };

  const renderMsg = (msg) => {
    if (msg.type === 'task_created') {
      return (
        <div key={msg.id} className="msg-row bot-row">
          <div className="avatar bot-av">🤖</div>
          <div className="bubble bot-bubble">
            <p className="bubble-text">Task created successfully ✅</p>
            <div className="inline-card">
              <TaskCard task={msg.task} currentUser={user} compact />
            </div>
          </div>
        </div>
      );
    }

    if (msg.type === 'task_list') {
      return (
        <div key={msg.id} className="msg-row bot-row">
          <div className="avatar bot-av">🤖</div>
          <div className="bubble bot-bubble">
            <p className="bubble-text">
              Found <strong>{msg.tasks.length}</strong> {msg.label} task{msg.tasks.length !== 1 ? 's' : ''}:
            </p>
            <div className="inline-list">
              {msg.tasks.map((t) => (
                <TaskCard key={t._id} task={t} currentUser={user} compact />
              ))}
            </div>
          </div>
        </div>
      );
    }

    const isUser = msg.from === 'user';
    return (
      <div key={msg.id} className={`msg-row ${isUser ? 'user-row' : 'bot-row'}`}>
        {!isUser && <div className="avatar bot-av">🤖</div>}
        <div className={`bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
          {msg.text?.split('\n').map((line, i) => (
            <p key={i} className="bubble-text">{line || ' '}</p>
          ))}
        </div>
        {isUser && (
          <div className="avatar user-av">
            {user.name[0].toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-wrap">
      {/* Header */}
      <div className="chat-head">
        <div className="chat-bot-av">🤖</div>
        <div className="chat-head-info">
          <span className="chat-head-name">TaskBot</span>
          <span className="chat-online">● Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-body">
        {messages.map(renderMsg)}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div className="quick-row">
        {QUICK.map((q) => (
          <button key={q} className="quick-chip" onClick={() => handleQuick(q)}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form className="chat-foot" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message in English, Hindi or Hinglish..."
          autoFocus
        />
        <button type="submit" className="send-btn" disabled={!input.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
