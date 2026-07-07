import React from 'react';

export default function ModuleShell({ title, description, onBack, children }) {
  return (
    <section className="page-shell">
      <div className="page-header card">
        <div>
          <p className="eyebrow">Module</p>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <button className="ghost-btn" onClick={onBack}>
          Back to dashboard
        </button>
      </div>

      <div className="page-content">{children}</div>
    </section>
  );
}
