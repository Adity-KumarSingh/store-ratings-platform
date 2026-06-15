import { useState, useMemo, ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;

  render?: (row: T) => ReactNode;

  sortValue?: (row: T) => string | number;
  sortable?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  rowKey: (row: T) => string | number;
}

type Direction = 'asc' | 'desc';

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = 'No records found.',
  rowKey,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;
    const getValue = col.sortValue ?? ((row: T) => row[sortKey]);
    return [...data].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return direction === 'asc' ? av - bv : bv - av;
      }
      return direction === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortKey, direction, columns]);

  const toggleSort = (col: Column<T>) => {
    if (col.sortable === false) return;
    if (sortKey === col.key) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setDirection('asc');
    }
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              onClick={() => toggleSort(col)}
              className={col.sortable === false ? '' : 'sortable'}
            >
              {col.header}
              {sortKey === col.key && <span className="sort-arrow">{direction === 'asc' ? ' ▲' : ' ▼'}</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="empty">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          sorted.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
