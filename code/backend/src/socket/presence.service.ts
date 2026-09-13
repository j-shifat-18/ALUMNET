/**
 * Presence Service — in-memory online user tracking.
 *
 * Maps userId (number) → Set of active socketIds.
 * Supporting multiple sockets per user (multi-device) from day one.
 *
 * This is intentionally a simple Map for v1.
 * Replace with Redis pub/sub when horizontal scaling is needed.
 */

const onlineUsers = new Map<number, Set<string>>();

// ─── Register / deregister ───────────────────────────────────────────────────

/**
 * Mark a socket as online for a user.
 * Returns true if this is the user's FIRST active connection (just came online).
 */
export function userConnected(userId: number, socketId: string): boolean {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  const sockets = onlineUsers.get(userId)!;
  const wasOffline = sockets.size === 0;
  sockets.add(socketId);
  return wasOffline;
}

/**
 * Remove a socket for a user.
 * Returns true if the user has NO more active connections (just went offline).
 */
export function userDisconnected(userId: number, socketId: string): boolean {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return false;

  sockets.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true; // truly offline now
  }
  return false;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Returns true if the user has at least one active socket connection. */
export function isUserOnline(userId: number): boolean {
  const sockets = onlineUsers.get(userId);
  return !!sockets && sockets.size > 0;
}

/** Returns all userIds that are currently online. */
export function getOnlineUserIds(): number[] {
  return Array.from(onlineUsers.keys());
}

/** Returns the number of active sockets for a user (0 if offline). */
export function getSocketCount(userId: number): number {
  return onlineUsers.get(userId)?.size ?? 0;
}
