
import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

function Editor() {
  const textareaRef = useRef(null);
  const [status, setStatus] = useState("Connecting...");
    const [onlineUsers, setOnlineUsers] = useState(1);

  useEffect(() => {
    const doc = new Y.Doc();

    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      "syncdoc-room",
      doc
    );

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

    // Initial content
    if (textareaRef.current) {
      textareaRef.current.value = yText.toString();
    }

    // Update textarea only if text actually changed
    const updateText = () => {
      if (!textareaRef.current) return;

      const newValue = yText.toString();

      if (textareaRef.current.value !== newValue) {
        const cursor = textareaRef.current.selectionStart;

        textareaRef.current.value = newValue;

        textareaRef.current.setSelectionRange(cursor, cursor);
      }
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
  
      const data = await response.json();
      alert("Document saved successfully!");
      console.log(data);
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
      

      <p>
        <strong>Status:</strong> {status}
      </p>
      <p>🟢 Users Online: {onlineUsers}</p>

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