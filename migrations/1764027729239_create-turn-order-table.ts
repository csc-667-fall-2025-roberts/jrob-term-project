import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Each row represents one player's position in the turn order
  pgm.createTable('turn_order', {
    id: 'id',
    game_id: {
      type: 'integer',
      notNull: true,
      references: 'games(id)',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    position: {
      type: 'integer',
      notNull: true,
      comment: 'Turn position (0 = first player)',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Ensure each player appears only once per game
  pgm.createConstraint('turn_order', 'unique_turn_order_game_user', {
    unique: ['game_id', 'user_id'],
  });

  // Ensure each position is used only once per game
  pgm.createConstraint('turn_order', 'unique_turn_order_game_position', {
    unique: ['game_id', 'position'],
  });

  // Index for quick lookups
  pgm.createIndex('turn_order', 'game_id');
  pgm.createIndex('turn_order', ['game_id', 'position']);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('turn_order');
}
