
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export function connectSocket(token) {
  return io(SOCKET_URL, {
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"],
  });
}
