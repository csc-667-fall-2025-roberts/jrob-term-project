import "express-session";

import { User } from "@shared/types";

declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}
