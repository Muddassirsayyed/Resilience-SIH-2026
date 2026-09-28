function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="logo">🚆</div>

        <div>
          <h2>RAILOPT</h2>
          <span>AI Maintenance Platform</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="system-status">
          <span className="status-dot"></span>
          System Online
        </div>

        <button className="notification-button" title="Notifications">
          🔔
          <span className="notification-badge">3</span>
        </button>

        <div className="user-profile">
          <div className="avatar">A</div>

          <div className="user-info">
            <strong>Administrator</strong>
            <span>Rail Operations</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;