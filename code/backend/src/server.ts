import { createServer } from "http";
import "dotenv/config";
import app from "./app.js";
import { initIO } from "./socket/io.js";
import { registerSocketAuth } from "./socket/socket.middleware.js";
import { registerChatHandlers } from "./socket/chat.socket.js";

const port = process.env.PORT || 8000;

async function main() {
  try {
    // 1. Wrap Express in a plain HTTP server so Socket.IO can share the same port
    const httpServer = createServer(app);

    // 2. Attach Socket.IO to the HTTP server
    const io = initIO(httpServer);

    // 3. Register Firebase auth middleware — runs before any event handler
    registerSocketAuth(io);

    // 4. Register all chat / presence event handlers
    registerChatHandlers(io);

    // 5. Start listening
    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Socket.IO ready on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
