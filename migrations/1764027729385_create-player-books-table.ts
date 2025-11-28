import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("player_books", {
    id: "id",
    game_id: {
      type: "integer",
      notNull: true,
      references: "games(id)",
      onDelete: "CASCADE",
    },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    rank: {
      type: "varchar(2)",
      notNull: true,
      comment: "Card rank: A, 2-10, J, Q, K",
    },
    completed_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Ensure one book per rank per player per game
  pgm.createConstraint("player_books", "unique_player_game_book", {
    unique: ["game_id", "user_id", "rank"],
  });

  // Indexes for quick lookups
  pgm.createIndex("player_books", "game_id");
  pgm.createIndex("player_books", ["game_id", "user_id"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("player_books");
}
