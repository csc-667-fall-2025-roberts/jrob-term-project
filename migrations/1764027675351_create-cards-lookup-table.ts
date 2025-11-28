import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Create canonical card lookup table
  pgm.createTable("cards", {
    id: "id",
    rank: {
      type: "varchar(2)",
      notNull: true,
      comment: "Card rank: A, 2-10, J, Q, K",
    },
    suit: {
      type: "varchar(1)",
      notNull: true,
      comment: "Card suit: H (Hearts), D (Diamonds), C (Clubs), S (Spades)",
    },
    display_name: {
      type: "varchar(20)",
      notNull: true,
      comment: 'Human-readable name (e.g., "Ace of Spades")',
    },
    sort_order: {
      type: "integer",
      notNull: true,
      comment: "Numerical order for sorting (1-52)",
    },
  });

  // Unique constraint on rank + suit combination
  pgm.addConstraint("cards", "unique_rank_suit", {
    unique: ["rank", "suit"],
  });

  // Populate with all 52 cards
  const suits = [
    { code: "H", name: "Hearts" },
    { code: "D", name: "Diamonds" },
    { code: "C", name: "Clubs" },
    { code: "S", name: "Spades" },
  ];

  const ranks = [
    { code: "A", name: "Ace", value: 1 },
    { code: "2", name: "2", value: 2 },
    { code: "3", name: "3", value: 3 },
    { code: "4", name: "4", value: 4 },
    { code: "5", name: "5", value: 5 },
    { code: "6", name: "6", value: 6 },
    { code: "7", name: "7", value: 7 },
    { code: "8", name: "8", value: 8 },
    { code: "9", name: "9", value: 9 },
    { code: "10", name: "10", value: 10 },
    { code: "J", name: "Jack", value: 11 },
    { code: "Q", name: "Queen", value: 12 },
    { code: "K", name: "King", value: 13 },
  ];

  let sortOrder = 1;
  for (const suit of suits) {
    for (const rank of ranks) {
      const displayName = `${rank.name} of ${suit.name}`;

      pgm.sql(`
        INSERT INTO cards (rank, suit, display_name, sort_order)
        VALUES ('${rank.code}', '${suit.code}', '${displayName}', ${sortOrder})
      `);

      sortOrder++;
    }
  }

  // Index for quick lookups by rank
  pgm.createIndex("cards", "rank");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("cards");
}
