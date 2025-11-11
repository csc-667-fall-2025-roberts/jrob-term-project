import { MigrationBuilder, PgType } from "node-pg-migrate";

const TABLE_NAME = "games";
const GAME_STATE_TYPE = "game_state";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType(GAME_STATE_TYPE, ["lobby", "active", "completed"]);

  pgm.createTable(TABLE_NAME, {
    id: "id",
    name: {
      type: `${PgType.VARCHAR}(100)`,
      notNull: false,
    },
    created_by: {
      type: PgType.INTEGER,
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    state: {
      type: GAME_STATE_TYPE,
      notNull: true,
      default: "lobby",
    },
    max_players: {
      type: PgType.INTEGER,
      notNull: true,
      default: 4,
    },
    created_at: {
      type: PgType.TIMESTAMP,
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex(TABLE_NAME, "state");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(TABLE_NAME);
  pgm.dropType(GAME_STATE_TYPE);
}
