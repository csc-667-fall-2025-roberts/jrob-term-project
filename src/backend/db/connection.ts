import { configDotenv } from "dotenv";
import pgPromise from "pg-promise";

configDotenv();

const pgp = pgPromise();

const connectionString = process.env.DATABASE_URL;

if (connectionString === undefined) {
  throw new Error("DATABASE_URL is not available in environment");
}

const db = pgp(connectionString);

export default db;
