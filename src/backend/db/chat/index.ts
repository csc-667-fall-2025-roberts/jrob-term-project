import type { ChatMessage } from "../../types/types";
import db from "../connection";
import { CREATE_MESSAGE, RECENT_MESSAGES } from "./sql";

const LIMIT = 100;

const list = async (limit: number = LIMIT) => {
  return await db.manyOrNone<ChatMessage>(RECENT_MESSAGES, [limit]);
};

const create = async (user_id: number, message: string) => {
  return await db.one<Omit<ChatMessage, "username">>(CREATE_MESSAGE, [user_id, message]);
};

export { create, list };
