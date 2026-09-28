import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Documents() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: "Project Proposal",
      lastEdited: "Today",
      favorite: true,
    },
    {
      id: 2,
      title: "Assignment",
      lastEdited: "Yesterday",
      favorite: false,
    },
    {
      id: 3,
      title: "Internship Report",
      lastEdited: "2 days ago",
      favorite: false,
    },
    {
      id: 4,
      title: "Meeting Notes",
      lastEdited: "3 days ago",
      favorite: true,
    },
  ]);

  const toggleFavorite = (id) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? { ...doc, favorite: !doc.favorite }
          : doc
      )
    );
  };

  const deleteDocument = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmDelete) return;

    setDocuments((prev) =>
      prev.filter((doc) => doc.id !== id)
    );
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>
      <Sidebar />

      <main
        style={{
          marginLeft: "250px",
          minHeight: "100vh",
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}

        <h1
          style={{
            color: "#4F46E5",
            fontSize: "36px",
            fontWeight: "700",
            margin: "0 0 8px 0",
          }}
        >
          📁 My Documents
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: "16px",
            marginBottom: "25px",
          }}
        >
          Manage, open and organize your SyncDoc documents.
        </p>

        {/* Search */}

        <input
          type="text"
          placeholder="🔍 Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "650px",
            padding: "14px 16px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "16px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {/* New Document */}

        <button
          onClick={() => navigate("/editor")}
          style={{
            marginTop: "20px",
            padding: "12px 22px",
            background: "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          + New Document
        </button>

        {/* Documents */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          {filteredDocuments.length === 0 ? (
            <div
              style={{
                background: "white",
                padding: "40px",
                borderRadius: "15px",
                textAlign: "center",
                color: "#777",
              }}
            >
              <h3>📭 No documents found</h3>
              <p>Try another search.</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                style={{
                  background: "white",
                  padding: "22px",
                  borderRadius: "15px",
                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.07)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "32px" }}>
                    📄
                  </span>

                  <button
                    onClick={() => toggleFavorite(doc.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "22px",
                      cursor: "pointer",
                    }}
                    title="Favorite"
                  >
                    {doc.favorite ? "⭐" : "☆"}
                  </button>
                </div>

                <h3
                  style={{
                    marginTop: "15px",
                    marginBottom: "8px",
                  }}
                >
                  {doc.title}
                </h3>

                <p
                  style={{
                    color: "#777",
                    fontSize: "14px",
                  }}
                >
                  Last edited: {doc.lastEdited}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "18px",
                  }}
                >
                  <button
                    onClick={() => navigate("/editor")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "#4F46E5",
                      color: "white",
                      border: "none",
                      borderRadius: "7px",
                      cursor: "pointer",
                    }}
                  >
                    Open
                  </button>

                  <button
                    onClick={() => deleteDocument(doc.id)}
                    style={{
                      padding: "10px 14px",
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      borderRadius: "7px",
                      cursor: "pointer",
                    }}
                    title="Delete document"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default Documents;
