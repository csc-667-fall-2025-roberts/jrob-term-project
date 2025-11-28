import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Tracks which card belongs to whom in each game
  // owner_id: 0 = in deck, user_id = in player's hand, -1 = in completed book
  pgm.createTable("game_cards", {
    id: "id",
    game_id: {
      type: "integer",
      notNull: true,
      references: "games(id)",
      onDelete: "CASCADE",
    },
    card_id: {
      type: "integer",
      notNull: true,
      references: "cards(id)",
      onDelete: "CASCADE",
    },
    owner_id: {
      type: "integer",
      notNull: true,
      comment: "0 = deck, user_id = player hand, -1 = completed book",
    },
    position: {
      type: "integer",
      comment: "Position in deck/hand (allows reordering), null for completed books",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Each card can only appear once per game
  pgm.createConstraint("game_cards", "unique_game_card", {
    unique: ["game_id", "card_id"],
  });

  // Indexes for quick lookups
  pgm.createIndex("game_cards", "game_id");
  pgm.createIndex("game_cards", ["game_id", "owner_id"]);
  pgm.createIndex("game_cards", ["game_id", "owner_id", "position"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("game_cards");
}
