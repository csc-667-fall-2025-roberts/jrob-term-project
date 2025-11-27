import express from "express";

import { requireGuest } from "@backend/middleware";

const router = express.Router();

router.get("/", requireGuest, (_request, response) => {
  response.render("root");
});

export default router;
