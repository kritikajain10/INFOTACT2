import Sidebar from "../components/Sidebar";

function Settings() {
  return (
    <div>
      <Sidebar />

      <main
        style={{
          marginLeft: "250px",
          minHeight: "100vh",
          padding: "40px",
          background: "#f4f6fb",
          boxSizing: "border-box",
        }}
      >
        <h1>⚙️ Settings</h1>

        <div
          style={{
            marginTop: "30px",
            maxWidth: "600px",
            padding: "30px",
            background: "white",
            borderRadius: "15px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >
          <h2>Account Settings</h2>

          <label>Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            style={inputStyle}
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            style={inputStyle}
          />

          <button
            style={{
              padding: "12px 25px",
              border: "none",
              borderRadius: "8px",
              background: "#3b1dcc",
              color: "white",
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
};

export default Settings;