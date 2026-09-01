import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { jsPDF } from "jspdf";

function Editor() {
  const textareaRef = useRef(null);

  const [status, setStatus] = useState("Connecting...");
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [lastSaved, setLastSaved] = useState("");

  useEffect(() => {
    const ydoc = new Y.Doc();

    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      "syncdoc-room",
      ydoc
    );

    const awareness = provider.awareness;

    awareness.setLocalStateField("user", {
      name: "User " + Math.floor(Math.random() * 1000),
      cursor: 0,
    });

    awareness.on("change", () => {
      setOnlineUsers(awareness.getStates().size);
    });

    provider.on("status", (event) => {
      setStatus(event.status);
    });

    const yText = ydoc.getText("content");

    if (textareaRef.current) {
      textareaRef.current.value = yText.toString();
    }

    const updateText = () => {
      if (!textareaRef.current) return;

      const newValue = yText.toString();

      if (textareaRef.current.value !== newValue) {
        const cursor = textareaRef.current.selectionStart;

        textareaRef.current.value = newValue;
        textareaRef.current.setSelectionRange(cursor, cursor);
      }

      setCharCount(newValue.length);

      const words = newValue.trim()
        ? newValue.trim().split(/\s+/).length
        : 0;

      setWordCount(words);

      const lines =
        newValue === "" ? 1 : newValue.split("\n").length;

      setLineCount(lines);
    };

    updateText();

    yText.observe(updateText);

    const handleInput = () => {
      if (!textareaRef.current) return;

      const value = textareaRef.current.value;

      ydoc.transact(() => {
        yText.delete(0, yText.length);
        yText.insert(0, value);
      });
    };

    const handleCursorMove = () => {
      if (!textareaRef.current) return;

      const cursor = textareaRef.current.selectionStart;

      setCursorPosition(cursor);

      awareness.setLocalStateField("user", {
        ...awareness.getLocalState().user,
        cursor,
      });
    };

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.addEventListener("input", handleInput);
      textarea.addEventListener("click", handleCursorMove);
      textarea.addEventListener("keyup", handleCursorMove);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener("input", handleInput);
        textarea.removeEventListener("click", handleCursorMove);
        textarea.removeEventListener("keyup", handleCursorMove);
      }

      yText.unobserve(updateText);
      provider.destroy();
      ydoc.destroy();
    };
  }, []);
  const saveDocument = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: textareaRef.current.value,
        }),
      });

      await response.json();

      setLastSaved(new Date().toLocaleTimeString());

      alert("Document saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save document.");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    const content = textareaRef.current?.value || "";

    const lines = doc.splitTextToSize(content, 180);

    doc.text(lines, 15, 20);

    doc.save("SyncDoc.pdf");
  };

  const exportHTML = () => {
    if (!textareaRef.current) return;

    const content = textareaRef.current.value;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<title>SyncDoc Export</title>
</head>
<body>
<pre>${content}</pre>
</body>
</html>`;

    const blob = new Blob([htmlContent], {
      type: "text/html",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "SyncDoc.html";
    link.click();

    URL.revokeObjectURL(url);
  };

  // ===== Formatting Toolbar =====

  const wrapSelection = (before, after = before) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const text = textarea.value;

    const selected = text.substring(start, end);

    const newText =
      text.substring(0, start) +
      before +
      selected +
      after +
      text.substring(end);

    textarea.value = newText;

    textarea.dispatchEvent(new Event("input"));
  };

  const clearEditor = () => {
    if (!textareaRef.current) return;

    textareaRef.current.value = "";

    textareaRef.current.dispatchEvent(new Event("input"));
  };
  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2>SyncDoc</h2>

      <p>
        <strong>Status:</strong> {status}
      </p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >
        <span>👥 Users: {onlineUsers}</span>
        <span>📝 Words: {wordCount}</span>
        <span>🔤 Characters: {charCount}</span>
        <span>📄 Lines: {lineCount}</span>
        <span>📍 Cursor: {cursorPosition}</span>
        <span>💾 Last Saved: {lastSaved || "Not Saved"}</span>
      </div>

      {/* Formatting Toolbar */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => wrapSelection("**")}
          style={{
            padding: "8px 18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          <b>B</b>
        </button>

        <button
          onClick={() => wrapSelection("*")}
          style={{
            padding: "8px 18px",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          <i>I</i>
        </button>

        <button
          onClick={() => wrapSelection("__")}
          style={{
            padding: "8px 18px",
            background: "#9333ea",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          <u>U</u>
        </button>

        <button
          onClick={clearEditor}
          style={{
            padding: "8px 18px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      <textarea
        ref={textareaRef}
        rows={20}
        cols={80}
        placeholder="Start typing..."
        style={{
          width: "700px",
          height: "350px",
          resize: "none",
          fontSize: "16px",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={saveDocument}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          💾 Save Document
        </button>

        <button
          onClick={exportPDF}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          📄 Export PDF
        </button>

        <button
          onClick={exportHTML}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            background: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          🌐 Export HTML
        </button>
      </div>
    </div>
  );
}

export default Editor;