import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside
      style={{
        width: "250px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "linear-gradient(180deg, #3b1dcc, #171078)",
        color: "white",
        padding: "30px 20px",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "50px",
        }}
      >
        📄 SyncDoc
      </h2>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Link to="/dashboard" style={linkStyle}>
          🏠 Dashboard
        </Link>

        <Link to="/documents" style={linkStyle}>
          📁 My Documents
        </Link>

        <Link to="/favorites" style={linkStyle}>
          ⭐ Favorites
        </Link>

        <Link to="/settings" style={linkStyle}>
          ⚙️ Settings
        </Link>
      </nav>

      <button
        onClick={logout}
        style={{
          width: "100%",
          marginTop: "60px",
          padding: "13px",
          border: "none",
          borderRadius: "8px",
          background: "#ff4b3e",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </aside>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "18px",
  padding: "10px",
};

export default Sidebar;
