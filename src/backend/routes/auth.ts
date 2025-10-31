import express from "express";
import { Auth } from "../db";
import { requireGuest } from "../middleware";

const router = express.Router();

router.get("/signup", requireGuest, async (_request, response) => {
  response.render("auth/signup");
});

router.get("/login", requireGuest, async (_request, response) => {
  response.render("auth/login");
});

router.post("/signup", requireGuest, async (request, response) => {
  const { username, email, password } = request.body;

  try {
    request.session.user = await Auth.signup(username, email, password);

    response.redirect("/lobby");
  } catch (e: any) {
    response.render("auth/signup", { error: e });
  }
});

router.post("/login", requireGuest, async (request, response) => {
  const { username, password } = request.body;

  try {
    request.session.user = await Auth.login(username, password);

    response.redirect("/lobby");
  } catch (e: any) {
    response.render("auth/login", { error: e });
  }
});

router.get("/logout", async (request, response) => {
  await new Promise((resolve, reject) => {
    request.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve("");
      }
    });
  }).catch((error) => console.error(error));

  response.redirect("/");
});

export default router;
