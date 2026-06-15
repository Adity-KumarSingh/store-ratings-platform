export function buildOrderBy(
  sortBy: unknown,
  order: unknown,
  allowed: Record<string, string>,
  fallback: string,
): string {
  const column = typeof sortBy === 'string' && allowed[sortBy] ? allowed[sortBy] : fallback;
  const direction = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY ${column} ${direction}`;
}
