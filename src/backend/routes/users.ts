import express from "express";
import db from "../db/connection";

const router = express.Router();

router.get("/", async (_request, response) => {
  const userListing = await db.manyOrNone("SELECT id, email, username FROM users");

  response.render("user_listing", { userListing });
});

router.post("/", async (request, response) => {
  const { username, email } = request.body;

  const result = db.one(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
    [username, email, "some-password"],
  );

  response.redirect("/users");
});

router.get("/:id", async (request, response) => {
  const { id } = request.params;

  const user = await db.oneOrNone("SELECT id, username, email FROM users WHERE id=$1", [id]);

  response.render("user", user);
});

export { router as userRoutes };
