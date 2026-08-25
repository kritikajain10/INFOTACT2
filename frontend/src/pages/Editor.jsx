import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

function Editor() {
  const textareaRef = useRef(null);

  const [status, setStatus] = useState("Connecting...");
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [lastSaved, setLastSaved] = useState("");

  useEffect(() => {
    const doc = new Y.Doc();

    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      "syncdoc-room",
      doc
    );

    // ✅ Missing line
    const awareness = provider.awareness;

    awareness.setLocalStateField("user", {
      name: "User " + Math.floor(Math.random() * 1000),
    });

    awareness.on("change", () => {
      setOnlineUsers(awareness.getStates().size);
    });

    provider.on("status", (event) => {
      setStatus(event.status);
    });

    const yText = doc.getText("content");

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

      const lines = newValue === "" ? 1 : newValue.split("\n").length;
      setLineCount(lines);
    };

    yText.observe(updateText);

    const handleInput = () => {
      if (!textareaRef.current) return;

      const value = textareaRef.current.value;

      doc.transact(() => {
        yText.delete(0, yText.length);
        yText.insert(0, value);
      });
    };

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.addEventListener("input", handleInput);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener("input", handleInput);
      }

      yText.unobserve(updateText);
      provider.destroy();
      doc.destroy();
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
          marginBottom: "15px",
          flexWrap: "wrap",
          fontWeight: "bold",
        }}
      >
        <span>👥 Users: {onlineUsers}</span>
        <span>📝 Words: {wordCount}</span>
        <span>🔤 Characters: {charCount}</span>
        <span>📄 Lines: {lineCount}</span>
        <span>💾 Last Saved: {lastSaved || "Not Saved"}</span>
      </div>

      <textarea
        ref={textareaRef}
        rows={20}
        cols={80}
        placeholder="Start typing..."
        style={{
          padding: "10px",
          fontSize: "16px",
          width: "700px",
          height: "350px",
          resize: "none",
        }}
      />

      <button
        onClick={saveDocument}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Save Document
      </button>
    </div>
  );
}

export default Editor;