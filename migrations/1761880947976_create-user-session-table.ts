import { MigrationBuilder, PgType } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("session", {
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
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("session");
}
