import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="main-content">
          <div className="page-header">
            <div>
              <h1>AI Maintenance Block Planner</h1>
              <p>
                Intelligent railway maintenance planning and fleet monitoring
              </p>
            </div>

            <button className="ai-button">
              ✨ Generate AI Plan
            </button>
          </div>

          <section className="stats-grid">
            <StatCard
              title="Total Trains"
              value="128"
              icon="🚆"
              subtitle="Across all zones"
            />

            <StatCard
              title="Maintenance Due"
              value="17"
              icon="🔧"
              subtitle="Next 7 days"
            />

            <StatCard
              title="Active Blocks"
              value="8"
              icon="🛠️"
              subtitle="Currently planned"
            />

            <StatCard
              title="Fleet Availability"
              value="94%"
              icon="📊"
              subtitle="Operational fleet"
            />
          </section>

          <section className="dashboard-grid">
            <div className="panel schedule-panel">
              <div className="panel-header">
                <div>
                  <h2>Maintenance Schedule</h2>
                  <p>Upcoming maintenance activities</p>
                </div>

                <button className="view-button">View All</button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Train</th>
                      <th>Depot</th>
                      <th>Maintenance</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>12001</td>
                      <td>Pune</td>
                      <td>Brake Inspection</td>
                      <td>22:00</td>
                      <td>
                        <span className="status planned">Planned</span>
                      </td>
                    </tr>

                    <tr>
                      <td>12015</td>
                      <td>Mumbai</td>
                      <td>Engine Check</td>
                      <td>23:30</td>
                      <td>
                        <span className="status progress">In Progress</span>
                      </td>
                    </tr>

                    <tr>
                      <td>12125</td>
                      <td>Nagpur</td>
                      <td>Wheel Inspection</td>
                      <td>01:00</td>
                      <td>
                        <span className="status planned">Planned</span>
                      </td>
                    </tr>

                    <tr>
                      <td>12245</td>
                      <td>Delhi</td>
                      <td>Safety Inspection</td>
                      <td>02:30</td>
                      <td>
                        <span className="status completed">Completed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel ai-panel">
              <div className="panel-header">
                <div>
                  <h2>🤖 AI Recommendation</h2>
                  <p>Optimization insight</p>
                </div>
              </div>

              <div className="ai-content">
                <div className="ai-icon">✨</div>

                <h3>Optimal maintenance block identified</h3>

                <p>
                  The system recommends scheduling maintenance for Train 12001
                  between <strong>22:00–23:30</strong>. This minimizes fleet
                  disruption while maintaining operational availability.
                </p>

                <div className="recommendation">
                  <span>Potential availability improvement</span>
                  <strong>+3.8%</strong>
                </div>

                <button className="apply-button">
                  Apply Recommendation
                </button>
              </div>
            </div>
          </section>

          <section className="panel fleet-panel">
            <div className="panel-header">
              <div>
                <h2>Fleet Overview</h2>
                <p>Current railway fleet condition</p>
              </div>
            </div>

            <div className="fleet-items">
              <div>
                <span className="fleet-dot operational"></span>
                <span>Operational</span>
                <strong>108</strong>
              </div>

              <div>
                <span className="fleet-dot maintenance"></span>
                <span>Under Maintenance</span>
                <strong>12</strong>
              </div>

              <div>
                <span className="fleet-dot inspection"></span>
                <span>Inspection</span>
                <strong>5</strong>
              </div>

              <div>
                <span className="fleet-dot inactive"></span>
                <span>Inactive</span>
                <strong>3</strong>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;