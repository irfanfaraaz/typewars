import { createServer } from "http";
import { Server } from "socket.io";
import { setupListeners } from "./SetuoListeners";

const PORT = process.env.PORT || 8000;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupListeners(io);

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
