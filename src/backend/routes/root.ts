import express from "express";

const router = express.Router();

router.get("/", (request, response) => {
  response.render("root", { gamesListing: ["a", "b", "c", "etc"] });
});

export default router;
