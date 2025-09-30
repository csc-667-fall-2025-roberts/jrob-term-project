import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
  response.send("this is from the test route /");
});

export { router as testRouter };
