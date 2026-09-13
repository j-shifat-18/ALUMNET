import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

// ─── Allowed CORS origins (mirrors app.ts) ───────────────────────────────────
const CORS_ORIGINS = [
  "http://localhost:3000",
  "https://alumnet-frontend.vercel.app",
  "https://alumnet-production.up.railway.app",
];

// ─── Module-level singleton ───────────────────────────────────────────────────
let _io: Server | null = null;

/**
 * Initialises the Socket.IO server and attaches it to the given HTTP server.
 * Must be called exactly once, from server.ts, before any socket handlers run.
 */
export function initIO(httpServer: HttpServer): Server {
  if (_io) return _io;

  _io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGINS,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Reconnection ping interval / timeout (ms)
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  return _io;
}

/**
 * Returns the Socket.IO server instance.
 * Throws if initIO() has not been called yet — guards against accidental
 * use before the server is ready.
 */
export function getIO(): Server {
  if (!_io) {
    throw new Error(
      "Socket.IO has not been initialised. Call initIO(httpServer) first.",
    );
  }
  return _io;
}
