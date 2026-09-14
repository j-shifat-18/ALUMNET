import { io } from "socket.io-client";

// One global socket instance for the whole app.
// autoConnect: false — we connect manually after Firebase resolves the user
// and we have a fresh ID token to pass in auth.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const socket = io(API_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["polling", "websocket"],
});

export default socket;
