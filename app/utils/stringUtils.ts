/**
 * Capitalize the first letter of a given string.
 *
 * @param str The input string.
 * @returns The string with the first character capitalized.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to camelCase.
 *
 * @param input The input string.
 * @returns The camelCase version of the string.
 */
export function toCamelCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase())
    .replace(/\s+/g, '');
}

/**
 * Reverses the given string.
 *
 * @param str The input string.
 * @returns The reversed string.
 */
export function reverseString(str: string): string {
  return str.split('').reverse().join('');
}