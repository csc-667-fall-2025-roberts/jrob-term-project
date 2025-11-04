import express from "express";
import { Chat } from "../db";

const router = express.Router();

router.get("/", async (request, response) => {
  response.status(202).send();

  const { id } = request.session;
  const messages = await Chat.list();

  const io = request.app.get("io");
  io.to(id).emit("chat:global:listing", { messages });
});

router.post("/", async (request, response) => {
  response.status(202).send();

  const { id, username } = request.session.user!;
  const { message } = request.body;

  const result = await Chat.create(id, message);

  const io = request.app.get("io");
  io.emit("chat:global:message", { ...result, username });
});

export default router;
