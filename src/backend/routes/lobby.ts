import express from "express";

const router = express.Router();

router.get("/", (request, response) => {
  const { user } = request.session;

  response.render("lobby", { user });
});

export default router;
