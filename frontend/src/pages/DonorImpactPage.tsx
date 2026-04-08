import { useState, useEffect } from 'react';
import { SiteNav } from '../components/SiteNav';
import { apiFetch } from '../lib/api';
import { KPICard } from '../components/KPICard';
import { DataCard } from '../components/DataCard';
import '../styles/pages/DonorImpactPage.css';

export function DonorImpactPage() {
  const [impactData, setImpactData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/donors/impact-dashboard')
      .then(setImpactData)
      .catch(() => setImpactData(null))
      .finally(() => setIsLoading(false));
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <>
        <SiteNav />
        <main className="container-fluid py-5">
          <div className="container text-center py-5">
            <p className="text-muted">Loading impact dashboard...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <main className="container-fluid py-5">
        <div className="container">
          {/* Header Section */}
          <div className="impact-header mb-5">
            <h1 className="impact-title">Our Impact Dashboard</h1>
            <p className="impact-subtitle">Real-time metrics showing the collective impact of our donor community across all safehouses.</p>
          </div>

          {/* KPI Cards Section */}
          {impactData && (
            <>
              <section className="dashboard-section mb-5">
                <div className="kpi-grid">
                  <KPICard
                    title="Total Funding Received"
                    value={formatCurrency(impactData.totalFunding || 0)}
                    color="success"
                  />
                  <KPICard
                    title="Lives Helped"
                    value={impactData.livesHelped || 0}
                    unit="residents"
                    color="danger"
                  />
                  <KPICard
                    title="Active Safehouses"
                    value={impactData.activeSafehouses || 0}
                    unit="locations"
                    color="primary"
                  />
                  <KPICard
                    title="Total Donors"
                    value={impactData.totalDonors || 0}
                    unit="supporters"
                    color="info"
                  />
                </div>
              </section>

              {/* Charts Section */}
              <section className="dashboard-section">
                <h4 className="section-title">Detailed Insights</h4>
                <div className="charts-grid">
                  {impactData.donationsByMonth && Object.keys(impactData.donationsByMonth).length > 0 && (
                    <DataCard title="Monthly Funding Trend">
                      <div className="chart-placeholder">
                        <p className="text-muted">Donation trends chart</p>
                        {/* Chart component would go here */}
                      </div>
                    </DataCard>
                  )}
                  
                  {impactData.residentsBySafehouse && Object.keys(impactData.residentsBySafehouse).length > 0 && (
                    <DataCard title="Residents by Safehouse">
                      <div className="safehouse-breakdown">
                        {Object.entries(impactData.residentsBySafehouse).map(([safehouse, count]: [string, any]) => (
                          <div key={safehouse} className="breakdown-row">
                            <span className="safehouse-name">{safehouse}</span>
                            <span className="resident-count">{count} residents</span>
                          </div>
                        ))}
                      </div>
                    </DataCard>
                  )}

                  {impactData.healthMetrics && (
                    <DataCard title="Average Health & Education">
                      <div className="metrics-display">
                        <div className="metric-row">
                          <span className="metric-label">Avg Health Score</span>
                          <span className="metric-value">{(impactData.healthMetrics.avgHealthScore || 0).toFixed(1)}/10</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">Avg Education Progress</span>
                          <span className="metric-value">{(impactData.healthMetrics.avgEducationProgress || 0).toFixed(1)}%</span>
                        </div>
                      </div>
                    </DataCard>
                  )}

                  {impactData.latestSnapshot && (
                    <DataCard title="Latest Impact Update">
                      <div className="snapshot-preview">
                        <h6 className="snapshot-headline">{impactData.latestSnapshot.headline}</h6>
                        <small className="text-muted">{new Date(impactData.latestSnapshot.snapshotDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
                        <p className="mt-2 snapshot-text">{impactData.latestSnapshot.summaryText}</p>
                      </div>
                    </DataCard>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
