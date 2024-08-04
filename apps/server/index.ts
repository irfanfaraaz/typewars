import { createServer } from "http";
import { Server } from "socket.io";
import { setupListeners } from "./SetuoListeners";

const PORT = process.env.PORT || 8000;

const httpServer = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Server is up and running");
  }
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupListeners(io);

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
