import { MigrationBuilder, PgType } from "node-pg-migrate";

const TABLE_NAME = "game_players";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(TABLE_NAME, {
    id: "id",
    game_id: {
      type: PgType.INTEGER,
      notNull: true,
      references: "games(id)",
      onDelete: "CASCADE",
    },
    user_id: {
      type: PgType.INTEGER,
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    position: {
      type: PgType.INTEGER,
      notNull: false, // NULL until game starts and turn order is set
      comment: "Turn position (0 = first player), NULL if game not started",
    },
  });

  pgm.addConstraint(TABLE_NAME, "unique_game_user", {
    unique: ["game_id", "user_id"],
  });

  pgm.createIndex(TABLE_NAME, "game_id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(TABLE_NAME);
}
