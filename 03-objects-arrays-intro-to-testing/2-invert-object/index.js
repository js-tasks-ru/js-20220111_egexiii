/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (!obj) {
    return;
  }
  const entries = Object.entries(obj);
  const reversedEntries = entries.map((field) => field.reverse());
  return Object.fromEntries(reversedEntries);
}
