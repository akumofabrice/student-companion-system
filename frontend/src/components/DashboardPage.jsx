import React from 'react';

const moduleCards = [
  {
    id: 'plans',
    title: 'Study Plans',
    description: 'Create and review your study schedule.',
    icon: '🗓️',
    path: '/plans',
  },
  {
    id: 'goals',
    title: 'Goals',
    description: 'Track active and completed goals.',
    icon: '🎯',
    path: '/goals',
  },
  {
    id: 'timetable',
    title: 'Timetable',
    description: 'Generate a structured weekly timetable.',
    icon: '🕒',
    path: '/timetable',
  },
  {
    id: 'forums',
    title: 'Community Forum',
    description: 'Join discussions and share ideas.',
    icon: '💬',
    path: '/forums',
  },
];

export default function DashboardPage({ user, summary, notifications, counts, navigate, requestNotifications }) {
  return (
    <section className="dashboard-shell">
      <div className="hero card">
        <div>
          <p className="eyebrow">Student control center</p>
          <h3>Everything you need, neatly organized.</h3>
          <p>
            Stay ahead with your plans, goals, schedule, and campus conversations in one calm place.
          </p>
        </div>

        <div className="hero-actions">
          <button className="ghost-btn" onClick={requestNotifications}>
            Enable alerts
          </button>
        </div>
      </div>

      <section className="stats-grid">
        <div className="card stat-card">
          <h3>{summary.plans}</h3>
          <p>Planned activities</p>
        </div>
        <div className="card stat-card">
          <h3>{summary.goals}</h3>
          <p>Active goals</p>
        </div>
        <div className="card stat-card">
          <h3>{summary.completedGoals}</h3>
          <p>Completed goals</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card notification-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Live updates</p>
              <h4>Upcoming and pending events</h4>
            </div>
            <span className="pill">Realtime</span>
          </div>

          <div className="notification-stats">
            <div className="notification-pill pending">
              Pending <strong>{counts.pending}</strong>
            </div>
            <div className="notification-pill completed">
              Completed <strong>{counts.completed}</strong>
            </div>
            <div className="notification-pill upcoming">
              Upcoming <strong>{counts.upcoming}</strong>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="empty-state">No activities yet. Start by creating a plan or goal.</p>
            ) : (
              notifications.slice(0, 6).map((item) => (
                <div key={item.id} className={`notification-item ${item.type}`}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                  </div>
                  <span className={`status-badge ${item.type}`}>{item.type}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Quick access</p>
              <h4>Choose a module</h4>
            </div>
          </div>

          <div className="module-grid">
            {moduleCards.map((card) => (
              <button
                key={card.id}
                type="button"
                className="module-card"
                onClick={() => navigate(card.path)}
              >
                <span className="module-icon">{card.icon}</span>
                <strong>{card.title}</strong>
                <span>{card.description}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
