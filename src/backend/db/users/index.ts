import bcrypt from "bcrypt";
import db from "../connection";
import { SIGNUP_SQL } from "./sql";

const SALT_ROUNDS = 10;
const GENERIC_FAILURE_MESSAGE = "Email or password is incorrect";

const signup = async (username: string, email: string, cleartextPassword: string) => {
  try {
    const hash = await bcrypt.hash(cleartextPassword, SALT_ROUNDS);

    return await db.one<{ id: number; username: string; email: string }>(SIGNUP_SQL, [
      username,
      email,
      hash,
    ]);
  } catch {
    throw "Username or email is invalid";
  }
};

const LOOKUP_USER = `SELECT * FROM users WHERE email=$1`;

const lookup = async (email: string) => {
  try {
    return await db.one<{
      id: number;
      email: string;
      username: string;
      password: string;
      created_at: Date;
    }>(LOOKUP_USER, [email]);
  } catch (e) {
    throw GENERIC_FAILURE_MESSAGE;
  }
};

const login = async (email: string, cleartextPassword: string) => {
  const user = await lookup(email);

  if (!(await bcrypt.compare(cleartextPassword, user.password))) {
    throw GENERIC_FAILURE_MESSAGE;
  }

  return user;
};

export { login, signup };
