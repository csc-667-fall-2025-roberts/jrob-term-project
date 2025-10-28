import express from "express";
import { Users } from "../../db";
import * as middleware from "../../middleware";

const router = express.Router();

router.get("/signup", middleware.requireGuest, (request, response) => {
  response.render("auth/signup");
});

router.post("/signup", middleware.requireGuest, async (request, response) => {
  const { username, email, password } = request.body;

  try {
    request.session.user = await Users.signup(username, email, password);

    response.redirect("/lobby");
  } catch (e) {
    console.log("Error while signing up:", e);
    response.render("auth/signup", { username, email, error: e });
  }
});

router.get("/login", middleware.requireGuest, (request, response) => {
  response.render("auth/login");
});

router.post("/login", middleware.requireGuest, async (request, response) => {
  const { email, password } = request.body;

  try {
    request.session.user = await Users.login(email, password);

    response.redirect("/lobby");
  } catch (e) {
    console.error("Error while logging in:", e);
    response.render("auth/login", { email, error: e });
  }
});

router.get("/logout", async (request, response) => {
  const { user } = request.session;

  await new Promise((resolve, reject) => {
    request.session.destroy((err) => {
      if (err) {
        return reject(err);
      }

      return resolve("");
    });
  }).catch((err) => {
    console.error(`An error occurred when destroying session for ${user?.id}`, err);
  });

  response.redirect("/");
});

export default router;
