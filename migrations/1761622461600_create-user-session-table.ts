import { MigrationBuilder, PgType } from "node-pg-migrate";

const TABLE_NAME = "session";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(TABLE_NAME, {
    sid: {
      type: PgType.VARCHAR,
      notNull: true,
      primaryKey: true,
    },
    sess: {
      type: PgType.JSON,
      notNull: true,
    },
    expire: {
      type: `${PgType.TIMESTAMP}(6)`,
      notNull: true,
    },
  });

  // Index on expiration for efficient cleanup
  pgm.createIndex("session", "expire");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(TABLE_NAME);
}
