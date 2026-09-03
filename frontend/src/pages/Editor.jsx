import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { jsPDF } from "jspdf";
import DOMPurify from "dompurify";

function Editor() {
  const textareaRef = useRef(null);

  const [status, setStatus] = useState("Connecting...");
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [lastSaved, setLastSaved] = useState("");
  const [previewHTML, setPreviewHTML] = useState("");

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

  const previewDocument = () => {
    if (!textareaRef.current) return;

    const cleanHTML = DOMPurify.sanitize(
      textareaRef.current.value.replace(/\n/g, "<br>")
    );

    setPreviewHTML(cleanHTML);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#f4f7fb",
      }}
    >
      <h2
        style={{
          color: "#2563eb",
          fontSize: "36px",
          marginBottom: "10px",
        }}
      >
        SyncDoc
      </h2>

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
          background: "white",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          justifyContent: "center",
          width: "90%",
          maxWidth: "900px",
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
          justifyContent: "center",
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
            transition: "0.3s",
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
            transition: "0.3s",
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
            transition: "0.3s",
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
            transition: "0.3s",
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
          width: "90%",
          maxWidth: "900px",
          minHeight: "350px",
          resize: "vertical",
          fontSize: "16px",
          padding: "15px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      />

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
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
            transition: "0.3s",
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
            transition: "0.3s",
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
            transition: "0.3s",
          }}
        >
          🌐 Export HTML
        </button>

        <button
          onClick={previewDocument}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "5px",
            transition: "0.3s",
          }}
        >
          👁 Preview
        </button>
      </div>

      {previewHTML && (
        <div
          style={{
            width: "90%",
            maxWidth: "900px",
            marginTop: "20px",
            padding: "20px",
            borderRadius: "10px",
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Document Preview</h3>

          <div
            dangerouslySetInnerHTML={{
              __html: previewHTML,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Editor;