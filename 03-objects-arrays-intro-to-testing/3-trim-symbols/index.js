/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  const sequences = Array.from(string)
    .reduce((acc, value) => {
      if (acc?.at(-1)?.includes(value)) {
        acc[acc.length - 1] += value;
      } else {
        acc.push(value);
      }
      return acc;
    }, ['']);

  return sequences
    .map((item) => item.length > size ? item.slice(0, size) : item)
    .join('');
}
