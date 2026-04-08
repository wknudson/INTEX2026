import '../styles/components/DonationBreakdownChart.css';

interface DonationBreakdownChartProps {
  data: Record<string, number>;
  title: string;
}

export function DonationBreakdownChart({ data, title }: DonationBreakdownChartProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="chart-container">
        <h6>{title}</h6>
        <p className="text-muted">No donation data available</p>
      </div>
    );
  }

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'];

  return (
    <div className="chart-container">
      <h6>{title}</h6>
      <div className="breakdown-list">
        {Object.entries(data).map(([type, count], index) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const color = colors[index % colors.length];
          
          return (
            <div key={type} className="breakdown-item">
              <div className="breakdown-header">
                <span className="breakdown-label">{type}</span>
                <span className="breakdown-count">{count}</span>
              </div>
              <div className="breakdown-bar-container">
                <div 
                  className="breakdown-bar" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                ></div>
              </div>
              <div className="breakdown-percentage">{percentage.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
