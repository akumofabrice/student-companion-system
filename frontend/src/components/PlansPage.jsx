import React from 'react';
import ModuleShell from './ModuleShell';
import { formatDateTime, getPlanStatus } from '../utils/helpers';

export default function PlansPage({ plans, createPlan, navigate }) {
  return (
    <ModuleShell
      title="Study Plans"
      description="Organize your learning sessions and deadlines."
      onBack={() => navigate('/')}
    >
      <div className="page-grid">
        <div className="card">
          <h4>Create a plan</h4>
          <form onSubmit={createPlan} className="stack">
            <input name="planDescription" placeholder="Plan description" required />
            <input name="planStart" type="datetime-local" required />
            <input name="planEnd" type="datetime-local" required />
            <button type="submit">Save plan</button>
          </form>
        </div>

        <div className="card">
          <h4>Your plans</h4>
          <ul className="item-list">
            {plans.map((plan) => (
              <li key={plan.planId}>
                <div>
                  <strong>{plan.planDescription}</strong>
                  <span>{formatDateTime(plan.planStart)} → {formatDateTime(plan.planEnd)}</span>
                </div>
                <span className={`status-badge ${getPlanStatus(plan)}`}>{getPlanStatus(plan)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ModuleShell>
  );
}
