import { linesData } from '../data/lines.data';

/**
 * Retrieves all text entries from the `linesData` object.
 *
 * Iterates through each line and language key in `linesData`, collecting
 * objects containing the text and its corresponding language key.
 */
export function getAllTextEntriesFromLinesData(): {
  text: string;
  key: string;
}[] {
  const arr: { text: string; key: string }[] = [];
  for (const lineKey in linesData) {
    const obj = linesData[lineKey as keyof typeof linesData];
    for (const langKey in obj) {
      arr.push({ text: obj[langKey as keyof typeof obj], key: langKey });
    }
  }
  return arr;
}

/**
 * Returns a random selection of text entries from the lines data.
 *
 * This function retrieves all text entries using `getAllTextEntriesFromLinesData`,
 * shuffles them randomly, and returns the first `n` entries.
 */
export function getRandomLineEntriesFromLinesData(
  n = 5
): { text: string; key: string }[] {
  const allEntries = getAllTextEntriesFromLinesData();
  const shuffled = allEntries.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * Generates an array of arrays containing line entries, each with a `text` and `key` property.
 * The outer array has a length specified by `linesCount`, and each inner array contains a random number
 * of line entries (between 3 and 5, inclusive).
 */
export function generateLinesArray(
  linesCount: number
): { text: string; key: string }[][] {
  return Array.from({ length: linesCount }, () =>
    getRandomLineEntriesFromLinesData(3 + Math.floor(Math.random() * 3))
  );
}
