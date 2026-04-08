import { useState, useEffect, useMemo } from 'react';

export function FilterSortTable({ columns, rows, onRowClick }: { columns: string[]; rows: any[]; onRowClick?: (row: any) => void }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(columns[0] ?? '');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => { setSortBy(columns[0] ?? ''); setPage(1); }, [columns.join('|'), rows.length]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.toLowerCase();
    return rows.filter((row) => columns.some((c) => String(row[c] ?? '').toLowerCase().includes(term)));
  }, [rows, columns, search]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const l = String(a[sortBy] ?? '').toLowerCase();
      const r = String(b[sortBy] ?? '').toLowerCase();
      if (l < r) return sortDir === 'asc' ? -1 : 1;
      if (l > r) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <div className="row g-2 mb-2">
        <div className="col-md-6"><input className="form-control form-control-sm" placeholder="Search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        <div className="col-md-4"><select className="form-select form-select-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>{columns.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
        <div className="col-md-2"><button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>{sortDir === 'asc' ? 'Asc' : 'Desc'}</button></div>
      </div>
      <div className="table-responsive">
        <table className="table table-sm table-striped">
          <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} onClick={() => onRowClick?.(row)} style={onRowClick ? { cursor: 'pointer' } : undefined}>
                {columns.map((c) => <td key={c}>{String(row[c] ?? '')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">Page {currentPage} of {totalPages} ({sorted.length} rows)</small>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Prev</button>
          <button className="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
