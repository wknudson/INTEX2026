import '../styles/components/KPICard.css';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export function KPICard({ title, value, unit, icon, color = 'primary', trend }: KPICardProps) {
  return (
    <div className={`kpi-card kpi-${color}`}>
      {icon && <div className="kpi-icon">{icon}</div>}
      <div className="kpi-content">
        <div className="kpi-title">{title}</div>
        <div className="kpi-value">
          {value}
          {unit && <span className="kpi-unit">{unit}</span>}
        </div>
        {trend && (
          <div className={`kpi-trend trend-${trend.direction}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
    </div>
  );
}
