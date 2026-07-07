import React from 'react';
import ModuleShell from './ModuleShell';

export default function ForumsPage({
  forums,
  createForum,
  activeForum,
  openForum,
  messages,
  messageText,
  setMessageText,
  sendMessage,
  navigate,
}) {
  return (
    <ModuleShell
      title="Community Forum"
      description="Start conversations and engage with your campus community."
      onBack={() => navigate('/')}
    >
      <div className="page-grid">
        <div className="card">
          <h4>Create a forum</h4>
          <form onSubmit={createForum} className="stack">
            <input name="forumName" placeholder="Forum name" required />
            <input name="forumDesc" placeholder="Description" />
            <input name="forumRules" placeholder="Rules" />
            <button type="submit">Create forum</button>
          </form>
        </div>

        <div className="card">
          <h4>Available forums</h4>
          <div className="forum-list">
            {forums.map((forum) => (
              <button
                key={forum.forumId}
                type="button"
                className={`forum-item ${activeForum?.forumId === forum.forumId ? 'active' : ''}`}
                onClick={() => openForum(forum)}
              >
                {forum.forumName}
              </button>
            ))}
          </div>

          {activeForum && (
            <div className="chat-box">
              <h4>{activeForum.forumName}</h4>
              <div className="messages">
                {messages.map((msg) => (
                  <div key={msg.messageId} className="message">
                    <strong>{msg.author?.username || 'You'}</strong>
                    <p>{msg.messageContent}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="stack">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message"
                />
                <button type="submit">Send</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </ModuleShell>
  );
}
