import "express-session";
import { User } from "../types/types";

declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}
