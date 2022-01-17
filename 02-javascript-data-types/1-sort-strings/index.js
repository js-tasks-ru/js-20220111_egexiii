/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const stringCompare = (a, b) => a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' });
  const arrCopy = [...arr];
  if (param === 'asc') {
    return arrCopy.sort((a, b) => stringCompare(a, b));
  } else if (param === 'desc') {
    return arrCopy.sort((a, b) => stringCompare(b, a));
  }
}
