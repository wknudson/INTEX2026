import '../styles/components/ImpactSnapshot.css';

interface ImpactSnapshotProps {
  headline: string;
  summaryText: string;
  date: string;
  metrics?: Record<string, any>;
}

export function ImpactSnapshot({ headline, summaryText, date, metrics }: ImpactSnapshotProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="impact-snapshot">
      <div className="impact-date">{formattedDate}</div>
      <h6 className="impact-headline">{headline}</h6>
      <p className="impact-summary">{summaryText}</p>
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="impact-metrics">
          {Object.entries(metrics).map(([key, value]) => (
            typeof value !== 'object' && (
              <div key={key} className="impact-metric-item">
                <span className="metric-key">{key}:</span>
                <span className="metric-value">{String(value)}</span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
