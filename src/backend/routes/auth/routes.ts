import express from "express";
import { Users } from "../../db";

const router = express.Router();

router.get("/signup", (request, response) => {
  response.render("auth/signup");
});

router.post("/signup", async (request, response) => {
  const { username, email, password } = request.body;

  try {
    await Users.signup(username, email, password);

    response.redirect("/lobby");
  } catch (e) {
    console.log("Error while signing up:", e);
    response.render("auth/signup", { username, email, error: e });
  }
});

router.get("/login", (request, response) => {
  response.render("auth/login");
});

router.post("/login", async (request, response) => {
  const { email, password } = request.body;

  try {
    await Users.login(email, password);

    response.redirect("/lobby");
  } catch (e) {
    console.error("Error while logging in:", e);
    response.render("auth/login", { email, error: e });
  }
});

export default router;
