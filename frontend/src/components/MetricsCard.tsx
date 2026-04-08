import { DataCard } from './DataCard';
import { MetricsInline } from './MetricsInline';

export function MetricsCard({ title, data }: { title: string; data: any }) {
  return <DataCard title={title}><MetricsInline data={data} /></DataCard>;
}
