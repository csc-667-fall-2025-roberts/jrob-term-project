import express from "express";
import createHttpError from "http-errors";
import morgan from "morgan";
import * as path from "path";

import rootRoutes from "./routes/root";
import { testRouter } from "./routes/test";

const app = express();

const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== "production";

app.use(morgan("dev"));

// In dev mode, serve from src/backend/public so browser-sync can detect changes
// In production, serve from dist/public
const publicDir = isDev
  ? path.join(process.cwd(), "src", "backend", "public")
  : path.join("dist", "public");
app.use(express.static(publicDir));

// In dev mode, views are in src/backend/views; in production they're in dist/views
const viewsDir = isDev
  ? path.join(process.cwd(), "src", "backend", "views")
  : path.join(__dirname, "views");
app.set("views", viewsDir);
app.set("view engine", "ejs");

app.use("/", rootRoutes);
app.use("/test", testRouter);

app.use((_request, _response, next) => {
  next(createHttpError(404));
});

// Error handler middleware (must be last)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  console.error(`Error ${status}:`, message);
  if (isDev && err.stack) {
    console.error(err.stack);
  }

  res.status(status).send(
    isDev
      ? `<html><body><h1>Error ${status}</h1><pre>${message}\n\n${err.stack || ""}</pre></body></html>`
      : `<html><body><h1>Error ${status}</h1><p>${message}</p></body></html>`
  );
});

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});
