

import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const documents = [
    {
      title: "Project Proposal",
      edited: "Today",
      icon: "📄",
    },
    {
      title: "Meeting Notes",
      edited: "Today",
      icon: "📝",
    },
    {
      title: "Research Paper",
      edited: "Yesterday",
      icon: "📚",
    },
    {
      title: "Assignment",
      edited: "2 days ago",
      icon: "📑",
    },
  ];

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <div className="sidebar">

        <h2>📄 SyncDoc</h2>

        <ul>
          <li
            onClick={() => navigate("/dashboard")}
            style={{ cursor: "pointer" }}
          >
            🏠 Dashboard
          </li>

          <li
            onClick={() => navigate("/documents")}
            style={{ cursor: "pointer" }}
          >
            📂 My Documents
          </li>

          <li
            onClick={() => navigate("/favorites")}
            style={{ cursor: "pointer" }}
          >
            ⭐ Favorites
          </li>

          <li
            onClick={() => navigate("/settings")}
            style={{ cursor: "pointer" }}
          >
            ⚙️ Settings
          </li>
        </ul>

        <button
          className="logout-btn"
          onClick={() => navigate("/")}
        >
          Logout
        </button>

      </div>


      {/* MAIN */}

      <div className="main">

        {/* NAVBAR */}

        <div className="navbar">

          <input
            type="text"
            placeholder="🔍 Search documents..."
          />

          <div className="profile">
            <span className="avatar">KJ</span>
          </div>

        </div>


        {/* WELCOME */}

        <div className="welcome">

          <div>
            <h1>
              Welcome to SyncDoc 👋
            </h1>

            <p>
              Create, edit and collaborate on documents
              in real time.
            </p>
          </div>

          <button
            className="new-btn"
            onClick={() => navigate("/editor")}
          >
            + New Document
          </button>

        </div>


        {/* STATS */}

        <div className="stats">

          <div className="stat-card">
            <span className="stat-icon">📄</span>
            <div>
              <h3>4</h3>
              <p>Total Documents</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <div>
              <h3>2</h3>
              <p>Favorites</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🕒</span>
            <div>
              <h3>2</h3>
              <p>Edited Today</p>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div>
              <h3>1</h3>
              <p>Active User</p>
            </div>
          </div>

        </div>


        {/* QUICK ACTIONS */}

        <h2 className="section-title">
          Quick Actions
        </h2>

        <div className="quick-actions">

          <div
            className="action-card"
            onClick={() => navigate("/editor")}
          >
            <span>➕</span>
            <h3>New Document</h3>
            <p>Create a new document</p>
          </div>

          <div
            className="action-card"
            onClick={() => navigate("/documents")}
          >
            <span>📁</span>
            <h3>My Documents</h3>
            <p>View all your documents</p>
          </div>

          <div
            className="action-card"
            onClick={() => navigate("/favorites")}
          >
            <span>⭐</span>
            <h3>Favorites</h3>
            <p>View your favorite documents</p>
          </div>

        </div>


        {/* RECENT DOCUMENTS */}

        <div className="recent-header">

          <h2 className="section-title">
            Recent Documents
          </h2>

          <button
            className="view-all"
            onClick={() => navigate("/documents")}
          >
            View All →
          </button>

        </div>


        <div className="document-grid">

          {documents.map((doc) => (

            <div
              className="card"
              key={doc.title}
            >

              <div className="card-top">

                <span className="document-icon">
                  {doc.icon}
                </span>

                <span className="favorite">
                  ☆
                </span>

              </div>

              <h3>{doc.title}</h3>

              <p>
                Last edited: {doc.edited}
              </p>

              <button
                onClick={() => navigate("/editor")}
              >
                Open
              </button>

            </div>

          ))}

        </div>


        {/* TIP */}

        <div className="dashboard-tip">

          <span>💡</span>

          <div>
            <h3>SyncDoc Tip</h3>

            <p>
              Use the formatting toolbar in the editor
              to make your documents easier to read.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
