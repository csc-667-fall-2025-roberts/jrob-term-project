import * as path from "path";
import express from "express";
import morgan from "morgan";
import createHttpError from "http-errors";

import rootRoutes from "./routes/root";
import { testRouter } from "./routes/test";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.static(path.join("dist", "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", rootRoutes);
app.use("/test", testRouter);

app.use((_request, _response, next) => {
  next(createHttpError(404));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
