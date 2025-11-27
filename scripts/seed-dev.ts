/**
 * Development seed script - creates test users for local development
 *
 * Usage: npm run seed:dev
 */

import bcrypt from "bcrypt";
import db from "../src/backend/db/connection";

const TEST_USERS = [
  { username: "jrob", email: "jrob@sfsu.edu", password: "password" },
  { username: "aaliyah", email: "aaliyah@test.com", password: "password123" },
  { username: "kenji", email: "kenji@test.com", password: "password123" },
  { username: "priya", email: "priya@test.com", password: "password123" },
  { username: "omar", email: "omar@test.com", password: "password123" },
];

async function seedUsers() {
  console.log("🌱 Seeding test users...\n");

  for (const user of TEST_USERS) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const result = await db.oneOrNone(
        `INSERT INTO users (username, email, password)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, username, email`,
        [user.username, user.email, hashedPassword]
      );

      if (result) {
        console.log(`  ✓ Created user: ${result.username} (id: ${result.id})`);
      } else {
        const existing = await db.one(
          "SELECT id, username FROM users WHERE email = $1",
          [user.email]
        );
        console.log(`  - User exists: ${existing.username} (id: ${existing.id})`);
      }
    } catch (error: any) {
      console.error(`  ✗ Failed to create ${user.username}: ${error.message}`);
    }
  }

  console.log("\n✅ Done! All test users have password: password123\n");
}

seedUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
