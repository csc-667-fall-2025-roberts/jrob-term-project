import { MigrationBuilder, PgType } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn("users", "password", {
    type: `${PgType.VARCHAR}(60)`,
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn("users", "password", {
    type: `${PgType.VARCHAR}(255)`,
  });
}
