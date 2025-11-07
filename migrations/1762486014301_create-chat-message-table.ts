import { MigrationBuilder, PgType } from "node-pg-migrate";

const TABLE_NAME = "chat_messages";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(TABLE_NAME, {
    id: "id",
    user_id: {
      type: PgType.INTEGER,
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    message: {
      type: PgType.TEXT,
      notNull: true,
    },
    created_at: {
      type: PgType.TIMESTAMP,
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex(TABLE_NAME, "created_at");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(TABLE_NAME);
}
