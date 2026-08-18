const http = require("http");
const WebSocket = require("ws");

const server = http.createServer();

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client Connected");

  ws.on("message", (message) => {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

server.listen(1234, () => {
  console.log("WebSocket running on port 1234");
});