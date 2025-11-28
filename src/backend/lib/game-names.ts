import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";

/**
 * Generates a random game name like "brave-green-dolphin"
 * Similar to GitHub Codespaces naming convention
 */
export const generateGameName = (): string => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    length: 3,
  });
};
