import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const documents = [
    "Project Proposal",
    "Meeting Notes",
    "Research Paper",
    "Assignment",
  ];

  return (
    <div className="dashboard">

      <div className="sidebar">
        <h2>📄 SyncDoc</h2>

        <ul>
          <li>🏠 Dashboard</li>
          <li>📂 My Documents</li>
          <li>⭐ Favorites</li>
          <li>⚙ Settings</li>
        </ul>

        <button
          className="logout-btn"
          onClick={() => navigate("/")}
        >
          Logout
        </button>
      </div>

      <div className="main">

        <div className="navbar">
          <input
            type="text"
            placeholder="🔍 Search documents..."
          />

          <div className="profile">
            <span className="avatar">KJ</span>
          </div>
        </div>

        <h1
  style={{
    color: "#4F46E5",
    fontSize: "42px",
    fontWeight: "bold"
  }}
>
  Welcome to SyncDoc 👋
</h1>
        <p>Create or open your collaborative documents.</p>

        <div className="document-grid">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="card"
              onClick={() => navigate("/editor")}
            >
              <h3>📄 {doc}</h3>
              <p>Last edited: Today</p>
            </div>
          ))}
        </div>

        <button
          className="new-btn"
          onClick={() => navigate("/editor")}
        >
          + New Document
        </button>

      </div>
    </div>
  );
}

export default Dashboard;