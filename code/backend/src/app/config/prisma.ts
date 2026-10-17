import { PrismaClient } from "../../../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import "dotenv/config";

// When running in Node.js (Docker, Railway, local dev) the Neon serverless
// driver cannot use the native browser WebSocket — it needs the `ws` package.
// In edge/browser environments this import is ignored.
// `ws` is already in node_modules as a transitive dep of socket.io.
if (typeof WebSocket === "undefined") {
  const { default: ws } = await import("ws");
  neonConfig.webSocketConstructor = ws;
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
