export function MetricsInline({ data }: { data: any }) {
  if (!data) return <p className="text-muted">Loading...</p>;
  return <div className="d-flex flex-wrap gap-2">{Object.entries(data).map(([k, v]) => {
    if (typeof v === 'object' && v !== null) return null;
    return <div key={k} className="metric-pill"><strong>{k}</strong>: {String(v)}</div>;
  })}</div>;
}
