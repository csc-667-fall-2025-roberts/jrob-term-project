import express from "express";
import createHttpError from "http-errors";
import morgan from "morgan";
import * as path from "path";

import bodyParser from "body-parser";
import { configDotenv } from "dotenv";
import logger from "./lib/logger";
import rootRoutes from "./routes/root";
import { userRoutes } from "./routes/users";

configDotenv();

const app = express();

const PORT = process.env.PORT || 3000;

// Filter out browser-generated requests from logs
app.use(morgan("dev", {
  skip: (req) => req.url.startsWith("/.well-known/")
}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// Serve static files from public directory (relative to this file's location)
// Dev: src/backend/public | Prod: dist/public
app.use(express.static(path.join(__dirname, "public")));

// Set views directory (relative to this file's location)
// Dev: src/backend/views | Prod: dist/views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", rootRoutes);
app.use("/users", userRoutes);

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

const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

server.on("error", (error) => {
  logger.error("Server error:", error);
});
