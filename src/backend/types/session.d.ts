import "express-session";

export interface User {
  id: number;
  username: string;
  email: string;
}

export type PrivateUser = User & {
  password: string;
  created_at: Date;
};

declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}
