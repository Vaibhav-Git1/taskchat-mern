import { formatDate } from '../utils/chatParser';

const STATUS_STYLE = {
  Pending:     { bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  'In Progress': { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  Completed:   { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
};

export default function TaskCard({ task, currentUser, compact = false }) {
  const s = STATUS_STYLE[task.status] || STATUS_STYLE.Pending;
  const isCreator = task.assignedBy?._id === currentUser?.id;

  return (
    <div className={`task-card ${compact ? 'task-card-compact' : ''}`}>
      <div className="task-card-top">
        <span className="task-title">{task.title}</span>
        <span className="status-badge" style={{ background: s.bg, color: s.color }}>
          <span className="status-dot" style={{ background: s.dot }} />
          {task.status}
        </span>
      </div>

      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      <div className="task-meta">
        <span className="meta-chip">📅 {formatDate(task.dueDate)}</span>
        {task.assignedTo && (
          <span className="meta-chip">👤 {task.assignedTo.name}</span>
        )}
      </div>

      <div className="task-footer">
        <span className="task-by">by {task.assignedBy?.name}</span>
        {isCreator && <span className="badge-creator">Creator</span>}
      </div>
    </div>
  );
}
