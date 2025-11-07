import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import { GLOBAL_ROOM } from "../../shared/chat-keys";
import { sessionMiddleware } from "../config/session";
import logger from "../lib/logger";
import { User } from "../types/types";

export const initSockets = (httpServer: HTTPServer) => {
  const io = new Server(httpServer);

  io.engine.use(sessionMiddleware);

  io.on("connection", (socket) => {
    // @ts-ignore
    const session = socket.request.session as { id: string; user: User };

    logger.info(`socket for user ${session.user.username} established`);

    socket.join(session.id);
    socket.join(GLOBAL_ROOM);

    socket.on("close", () => {
      logger.info(`socket for user ${session.user.username} closed`);
    });
  });

  return io;
};
