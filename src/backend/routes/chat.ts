import express from "express";
import * as messageKeys from "../../shared/chat-keys";
import { Chat } from "../db";

const router = express.Router();

router.get("/", async (request, response) => {
  response.status(202).send();

  const { id } = request.session;
  const messages = await Chat.list();

  const io = request.app.get("io");
  io.to(id).emit(messageKeys.CHAT_LISTING(), { messages });
});

router.post("/", async (request, response) => {
  response.status(202);

  const { id, username } = request.session.user!;
  // @ts-ignore
  const { message } = request.body;

  const result = await Chat.create(id, message);

  const io = request.app.get("io");
  io.emit(messageKeys.CHAT_MESSAGE(), { ...result, username });
});

export default router;
