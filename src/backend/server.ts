import express from "express";
import createHttpError from "http-errors";
import morgan from "morgan";
import * as path from "path";

import bodyParser from "body-parser";
import { configDotenv } from "dotenv";
import { createServer } from "http";
import { sessionMiddleware } from "./config/session";
import logger from "./lib/logger";
import { requireUser } from "./middleware";
import * as routes from "./routes";
import { initSockets } from "./sockets/init";

configDotenv();

// Set up livereload in development
const isDevelopment = process.env.NODE_ENV !== "production";
if (isDevelopment) {
  const livereload = require("livereload");

  const liveReloadServer = livereload.createServer({
    exts: ["ejs", "css", "js"],
  });
  liveReloadServer.watch([path.join(__dirname, "views"), path.join(__dirname, "public")]);
}

const app = express();
const httpServer = createServer(app);

app.set("trust proxy", 1);

app.set("io", initSockets(httpServer));

const PORT = process.env.PORT || 3000;

// Inject livereload script in development
if (isDevelopment) {
  const connectLivereload = require("connect-livereload");
  app.use(connectLivereload());
}

// Filter out browser-generated requests from logs
app.use(
  morgan("dev", {
    skip: (req) => req.url.startsWith("/.well-known/"),
  }),
);
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// Serve static files from public directory (relative to this file's location)
// Dev: src/backend/public | Prod: dist/public
app.use(express.static(path.join(__dirname, "public")));

// Set views directory (relative to this file's location)
// Dev: src/backend/views | Prod: dist/views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(sessionMiddleware);

app.use("/", routes.root);
app.use("/auth", routes.auth);
app.use("/lobby", requireUser, routes.lobby);
app.use("/chat", requireUser, routes.chat);
app.use("/games", requireUser, routes.games);

app.use((_request, _response, next) => {
  next(createHttpError(404));
});

// Error handler middleware (must be last)
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const isProduction = process.env.NODE_ENV === "production";

  // Skip logging browser-generated requests
  if (!req.url.startsWith("/.well-known/")) {
    const errorMsg = `${message} (${req.method} ${req.url})`;

    if (isProduction) {
      // Production: Log to file with full stack, show concise console message
      logger.error(errorMsg, { stack: err.stack });
      console.error(`Error ${status}: ${message} - See logs/error.log for details`);
    } else {
      // Development: Log everything to console
      logger.error(errorMsg, err);
    }
  }

  res.status(status).render("errors/error", {
    status,
    message,
    stack: isProduction ? null : err.stack,
  });
});

const server = httpServer.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

httpServer.on("error", (error) => {
  logger.error("Server error:", error);
});
