import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Add game state columns to games table
  pgm.addColumns("games", {
    current_turn_user_id: {
      type: "integer",
      references: "users(id)",
      onDelete: "SET NULL",
    },
    started_at: {
      type: "timestamp",
    },
    ended_at: {
      type: "timestamp",
    },
    winner_id: {
      type: "integer",
      references: "users(id)",
      onDelete: "SET NULL",
    },
  });

  // Add index on current_turn_user_id for quick lookups
  pgm.createIndex("games", "current_turn_user_id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("games", "current_turn_user_id");
  pgm.dropColumns("games", ["current_turn_user_id", "started_at", "ended_at", "winner_id"]);
}
