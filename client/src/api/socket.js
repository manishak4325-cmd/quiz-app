import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Single shared socket instance for the whole app (created lazily so it
// doesn't try to connect before the app mounts).
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: true });
  }
  return socket;
}
