import { useState, useEffect } from 'react';
import { SiteNav } from '../components/SiteNav';
import { apiFetch } from '../lib/api';

export function DonorImpactPage() {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  useEffect(() => {
    apiFetch<any[]>('/api/donors/impact').then(setSnapshots).catch(() => setSnapshots([]));
  }, []);

  return (
    <>
      <SiteNav />
      <main className="container py-4">
        <h1>Donor Impact</h1>
        <p className="text-muted">Published monthly snapshots from safehouse activity.</p>
        {snapshots.length === 0 ? <p>No published snapshots yet.</p> : null}
        <div className="row g-3">
          {snapshots.map((item) => (
            <div className="col-md-6" key={item.snapshotId}>
              <div className="card p-3 h-100">
                <h5>{item.headline}</h5>
                <small className="text-muted">{String(item.snapshotDate)}</small>
                <p className="mt-2 mb-0">{item.summaryText}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
