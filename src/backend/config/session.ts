import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import db from "../db/connection";

const PgSession = connectPgSimple(session);

export const sessionMiddleware = session({
  store: new PgSession({
    // @ts-ignore
    pool: db.$pool,
    tableName: "session",
  }),
  secret: process.env.SESSION_SECRET || "this should not be used",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});
