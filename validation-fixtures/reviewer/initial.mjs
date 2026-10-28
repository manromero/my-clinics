// Intentional exercise defect; never import this fixture into production code.
export function countAtOrBelow(values, limit) {
  return values.filter((value) => value < limit).length;
}
