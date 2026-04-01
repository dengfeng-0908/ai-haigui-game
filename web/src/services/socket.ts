import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? "http://localhost:3001" : undefined);

export function createRoomSocket() {
  return io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket", "polling"],
  });
}
