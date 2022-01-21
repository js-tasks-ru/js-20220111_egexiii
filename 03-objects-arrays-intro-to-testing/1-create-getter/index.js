/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const chainedPath = path.split('.');

  if (!chainedPath.length) {
    return;
  }

  return (src) => {
    return chainedPath.reduce((acc, key) => acc ? acc[key] : acc, src);
  };
}
