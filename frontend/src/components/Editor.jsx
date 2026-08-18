import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

function Editor() {
  const textareaRef = useRef();

  useEffect(() => {
    const ydoc = new Y.Doc();

    const provider = new WebsocketProvider(
      "ws://localhost:1234",
      "syncdoc-room",
      ydoc
    );

    const ytext = ydoc.getText("document");

    textareaRef.current.value = ytext.toString();

    ytext.observe(() => {
      textareaRef.current.value = ytext.toString();
    });

    textareaRef.current.addEventListener("input", () => {
      ytext.delete(0, ytext.length);
      ytext.insert(0, textareaRef.current.value);
    });

    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  return (
    <textarea
      ref={textareaRef}
      rows="20"
      cols="80"
      placeholder="Start typing..."
    />
  );
}

export default Editor;