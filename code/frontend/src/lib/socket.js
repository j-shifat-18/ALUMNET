import { io } from "socket.io-client";

// One global socket instance for the whole app.
// autoConnect: false — we connect manually after Firebase resolves the user
// and we have a fresh ID token to pass in auth.
const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;
