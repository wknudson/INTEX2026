import { ReactNode } from 'react';

export function DataCard({ title, children }: { title: string; children: ReactNode }) {
  return <section className="card p-3 mb-3"><h5>{title}</h5>{children}</section>;
}
