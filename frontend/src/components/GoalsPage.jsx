import React from 'react';
import ModuleShell from './ModuleShell';

export default function GoalsPage({ goals, createGoal, navigate }) {
  return (
    <ModuleShell
      title="Goals"
      description="Track progress and celebrate completed milestones."
      onBack={() => navigate('/')}
    >
      <div className="page-grid">
        <div className="card">
          <h4>Add a goal</h4>
          <form onSubmit={createGoal} className="stack">
            <input name="goalDescription" placeholder="Goal description" required />
            <input name="goalCategory" placeholder="Category" required />
            <button type="submit">Save goal</button>
          </form>
        </div>

        <div className="card">
          <h4>Your goals</h4>
          <ul className="item-list">
            {goals.map((goal) => (
              <li key={goal.goalId}>
                <div>
                  <strong>{goal.goalDescription}</strong>
                  <span>{goal.goalCategory} • {goal.status}</span>
                </div>
                <span className={`status-badge ${goal.status === 'completed' ? 'completed' : 'pending'}`}>
                  {goal.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ModuleShell>
  );
}
