import { Server } from "socket.io";
import { Game } from "./classes/game";

export const rooms = new Map<string, Game>();
export function setupListeners(io: Server) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-game", (roomId: string, name: string) => {
      if (!roomId) {
        return socket.emit("error", "Room ID is required");
      }

      if (!name) {
        return socket.emit("error", "Name is required");
      }

      socket.join(roomId);

      if (rooms.has(roomId)) {
        const game = rooms.get(roomId);

        if (!game) {
          return socket.emit("error", "Game not found");
        }

        game.joinPlayer(socket.id, name, socket);
      } else {
        const game = new Game(roomId, io, socket.id);
        game.joinPlayer(socket.id, name, socket);
        rooms.set(roomId, game);
      }

      io.to(roomId).emit("user-joined", { name });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
