import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("game_actions", {
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
    action_type: {
      type: "varchar(50)",
      notNull: true,
      comment: "Type of action: ask_for_cards, go_fish, complete_book, game_start, game_end",
    },
    target_user_id: {
      type: "integer",
      references: "users(id)",
      onDelete: "SET NULL",
      comment: "Target player for ask_for_cards action",
    },
    rank: {
      type: "varchar(2)",
      comment: "Card rank for ask_for_cards or complete_book: A, 2-10, J, Q, K",
    },
    result: {
      type: "varchar(20)",
      comment: "Result of action: success, go_fish, etc.",
    },
    cards_received: {
      type: "integer",
      comment: "Number of cards received in ask_for_cards action",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Indexes for querying game history
  pgm.createIndex("game_actions", "game_id");
  pgm.createIndex("game_actions", ["game_id", "created_at"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("game_actions");
}
