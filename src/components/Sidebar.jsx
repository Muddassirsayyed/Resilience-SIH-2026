function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <p className="sidebar-title">MAIN MENU</p>

        <button className="sidebar-item active">
          <span>📊</span>
          <span>Dashboard</span>
        </button>

        <button className="sidebar-item">
          <span>🚆</span>
          <span>Trains</span>
        </button>

        <button className="sidebar-item">
          <span>🔧</span>
          <span>Maintenance</span>
        </button>

        <button className="sidebar-item">
          <span>🛠️</span>
          <span>Maintenance Blocks</span>
        </button>

        <button className="sidebar-item">
          <span>📅</span>
          <span>Schedule</span>
        </button>

        <button className="sidebar-item">
          <span>⚠️</span>
          <span>Conflicts</span>
        </button>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-title">ANALYTICS</p>

        <button className="sidebar-item">
          <span>📈</span>
          <span>Performance</span>
        </button>

        <button className="sidebar-item">
          <span>🤖</span>
          <span>AI Insights</span>
        </button>

        <button className="sidebar-item">
          <span>📋</span>
          <span>Reports</span>
        </button>
      </div>

      <div className="sidebar-bottom">
        <button className="sidebar-item">
          <span>⚙️</span>
          <span>Settings</span>
        </button>

        <button className="sidebar-item">
          <span>❓</span>
          <span>Help & Support</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;