import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { jsPDF } from "jspdf";
import DOMPurify from "dompurify";

function Editor() {
  const editorRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  const [status, setStatus] = useState("Connecting...");
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [lastSaved, setLastSaved] = useState("");
  const [previewHTML, setPreviewHTML] = useState("");

  const updateStats = () => {
    if (!editorRef.current) return;

    const text = editorRef.current.innerText || "";

    setCharCount(text.length);

    const words = text.trim()
      ? text.trim().split(/\s+/).length
      : 0;

    setWordCount(words);

    const lines =
      text === "" ? 1 : text.split("\n").length;

    setLineCount(lines);

    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      if (editorRef.current.contains(range.startContainer)) {
        const preCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(editorRef.current);
        preCaretRange.setEnd(
          range.startContainer,
          range.startOffset
        );

        setCursorPosition(preCaretRange.toString().length);
      }
    }
  };

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

    const updateEditor = () => {
      if (!editorRef.current) return;

      const newHTML = yText.toString();

      if (editorRef.current.innerHTML !== newHTML) {
        isRemoteUpdate.current = true;

        editorRef.current.innerHTML = newHTML;

        isRemoteUpdate.current = false;
      }

      updateStats();
    };

    updateEditor();

    yText.observe(updateEditor);

    const handleInput = () => {
      if (!editorRef.current) return;

      if (isRemoteUpdate.current) return;

      const html = editorRef.current.innerHTML;

      ydoc.transact(() => {
        yText.delete(0, yText.length);
        yText.insert(0, html);
      });

      updateStats();
    };

    const handleCursorMove = () => {
      updateStats();

      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);

      if (!editorRef.current.contains(range.startContainer)) {
        return;
      }

      const preCaretRange = range.cloneRange();

      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(
        range.startContainer,
        range.startOffset
      );

      const cursor = preCaretRange.toString().length;

      awareness.setLocalStateField("user", {
        ...awareness.getLocalState().user,
        cursor,
      });
    };

    const editor = editorRef.current;

    if (editor) {
      editor.addEventListener("input", handleInput);
      editor.addEventListener("click", handleCursorMove);
      editor.addEventListener("keyup", handleCursorMove);
      editor.addEventListener("mouseup", handleCursorMove);
    }

    return () => {
      if (editor) {
        editor.removeEventListener("input", handleInput);
        editor.removeEventListener("click", handleCursorMove);
        editor.removeEventListener("keyup", handleCursorMove);
        editor.removeEventListener("mouseup", handleCursorMove);
      }

      yText.unobserve(updateEditor);
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  // =========================
  // FORMATTING
  // =========================

  const formatText = (command) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    document.execCommand(command, false, null);

    editorRef.current.dispatchEvent(
      new Event("input", { bubbles: true })
    );

    updateStats();
  };

  const clearEditor = () => {
    if (!editorRef.current) return;

    editorRef.current.innerHTML = "";

    editorRef.current.dispatchEvent(
      new Event("input", { bubbles: true })
    );

    updateStats();
  };

  // =========================
  // SAVE
  // =========================

  const saveDocument = async () => {
    try {
      const content = editorRef.current?.innerHTML || "";

      const response = await fetch(
        "http://localhost:5000/api/documents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      await response.json();

      setLastSaved(
        new Date().toLocaleTimeString()
      );

      alert("Document saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save document.");
    }
  };

  // =========================
  // PDF
  // =========================

  const exportPDF = () => {
    const doc = new jsPDF();

    const content =
      editorRef.current?.innerText || "";

    const lines = doc.splitTextToSize(
      content,
      180
    );

    doc.text(lines, 15, 20);

    doc.save("SyncDoc.pdf");
  };

  // =========================
  // HTML EXPORT
  // =========================

  const exportHTML = () => {
    if (!editorRef.current) return;

    const content = editorRef.current.innerHTML;

    const cleanHTML =
      DOMPurify.sanitize(content);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>SyncDoc Export</title>

<style>
body {
  font-family: Arial, sans-serif;
  padding: 40px;
  line-height: 1.6;
}

.document {
  max-width: 900px;
  margin: auto;
}
</style>

</head>

<body>

<div class="document">
${cleanHTML}
</div>

</body>
</html>
`;

    const blob = new Blob(
      [htmlContent],
      { type: "text/html" }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = "SyncDoc.html";

    link.click();

    URL.revokeObjectURL(url);
  };

  // =========================
  // PREVIEW
  // =========================

  const previewDocument = () => {
    if (!editorRef.current) return;

    const cleanHTML =
      DOMPurify.sanitize(
        editorRef.current.innerHTML
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
        <strong>Status:</strong>{" "}
        {status}
      </p>

      {/* =========================
          STATISTICS
      ========================= */}

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
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.1)",
          justifyContent: "center",
          width: "90%",
          maxWidth: "900px",
        }}
      >
        <span>
          👥 Users: {onlineUsers}
        </span>

        <span>
          📝 Words: {wordCount}
        </span>

        <span>
          🔤 Characters: {charCount}
        </span>

        <span>
          📄 Lines: {lineCount}
        </span>

        <span>
          📍 Cursor: {cursorPosition}
        </span>

        <span>
          💾 Last Saved:{" "}
          {lastSaved || "Not Saved"}
        </span>
      </div>

      {/* =========================
          FORMATTING TOOLBAR
      ========================= */}

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
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() =>
            formatText("bold")
          }
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
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() =>
            formatText("italic")
          }
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
          onMouseDown={(e) =>
            e.preventDefault()
          }
          onClick={() =>
            formatText("underline")
          }
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

      {/* =========================
          RICH TEXT EDITOR
      ========================= */}

      <div
        ref={editorRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        data-placeholder="Start typing..."
        onInput={updateStats}
        style={{
          width: "90%",
          maxWidth: "900px",
          minHeight: "350px",
          padding: "15px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          background: "white",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.1)",
          fontSize: "16px",
          lineHeight: "1.6",
          outline: "none",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      />

      {/* =========================
          ACTION BUTTONS
      ========================= */}

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

        <button
          onClick={previewDocument}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          👁 Preview
        </button>
      </div>

      {/* =========================
          PREVIEW
      ========================= */}

      {previewHTML && (
        <div
          style={{
            width: "90%",
            maxWidth: "900px",
            marginTop: "20px",
            padding: "20px",
            borderRadius: "10px",
            background: "white",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.1)",
            boxSizing: "border-box",
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