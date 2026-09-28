import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Favourites() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6fb",
      }}
    >
      <Sidebar />

      <main
        style={{
          marginLeft: "250px",
          minHeight: "100vh",
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            color: "#4F46E5",
            fontSize: "36px",
            marginBottom: "10px",
          }}
        >
          ⭐ Favorites
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Your favorite documents.
        </p>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "260px",
              padding: "25px",
              background: "white",
              borderRadius: "15px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: "32px" }}>
              📄
            </div>

            <h3>Project Proposal</h3>

            <p style={{ color: "#777" }}>
              Last edited: Today
            </p>

            <button
              onClick={() => navigate("/editor")}
              style={{
                width: "100%",
                padding: "10px",
                background: "#4F46E5",
                color: "white",
                border: "none",
                borderRadius: "7px",
                cursor: "pointer",
              }}
            >
              Open Document
            </button>
          </div>

          <div
            style={{
              width: "260px",
              padding: "25px",
              background: "white",
              borderRadius: "15px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: "32px" }}>
              📝
            </div>

            <h3>Meeting Notes</h3>

            <p style={{ color: "#777" }}>
              Last edited: Yesterday
            </p>

            <button
              onClick={() => navigate("/editor")}
              style={{
                width: "100%",
                padding: "10px",
                background: "#4F46E5",
                color: "white",
                border: "none",
                borderRadius: "7px",
                cursor: "pointer",
              }}
            >
              Open Document
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Favourites;
