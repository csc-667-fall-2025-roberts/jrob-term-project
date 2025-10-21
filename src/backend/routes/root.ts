import express from "express";

const router = express.Router();

router.get("/", (request, response) => {
  response.render("root", { gamesListing: ["a", "b", "c", "d", "etc"] });
});

export default router;
