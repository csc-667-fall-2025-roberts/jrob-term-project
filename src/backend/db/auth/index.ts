import bcrypt from "bcrypt";
import type { SecureUser, User } from "../../../types/types";
import db from "../connection";
import { LOGIN, SIGNUP } from "./sql";

const signup = async (username: string, email: string, clearTextPassword: string) => {
  const password = await bcrypt.hash(clearTextPassword, 10);

  try {
    return await db.one<User>(SIGNUP, [username, email, password]);
  } catch (e: any) {
    throw "Email or username invalid";
  }
};

const login = async (username: string, clearTextPassword: string) => {
  try {
    const secureUser = await db.one<SecureUser>(LOGIN, [username]);

    if (await bcrypt.compare(clearTextPassword, secureUser.password)) {
      const { id, username, email, created_at } = secureUser;

      return { id, username, email, created_at } as User;
    } else {
      throw "Invalid login information";
    }
  } catch (e: any) {
    throw "Invalid login information";
  }
};

export { login, signup };
