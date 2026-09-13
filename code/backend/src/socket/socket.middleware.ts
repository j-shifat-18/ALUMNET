import type { Server, Socket } from "socket.io";
import admin from "../app/config/firebaseAdmin.js";
import { prisma } from "../app/config/prisma.js";

// ─── Extend Socket data with our verified user ───────────────────────────────

export interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: number;       // DB primary key (User.id)
      uid: string;      // Firebase UID
      name: string;
    };
  };
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

/**
 * Registers a Socket.IO authentication middleware on the given server.
 *
 * The client must send the Firebase ID token in the handshake auth object:
 *   socket = io(URL, { auth: { token: "<firebase-id-token>" } })
 *
 * On success:  socket.data.user is populated and the connection proceeds.
 * On failure:  the connection is rejected with an "Authentication error".
 */
export function registerSocketAuth(io: Server): void {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;

      if (!token) {
        return next(new Error("Authentication error: token missing"));
      }

      // Verify the Firebase ID token
      const decoded = await admin.auth().verifyIdToken(token);

      // Look up the DB user — we need the integer PK, not just the Firebase UID
      const dbUser = await prisma.user.findUnique({
        where: { uid: decoded.uid },
        select: { id: true, uid: true, name: true },
      });

      if (!dbUser) {
        return next(new Error("Authentication error: user not found"));
      }

      // Attach to socket for use in all event handlers
      (socket as AuthenticatedSocket).data.user = dbUser;

      next();
    } catch {
      next(new Error("Authentication error: invalid token"));
    }
  });
}
