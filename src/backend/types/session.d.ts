import "express-session";
import { User } from "./types";

declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}
