import { useState, useEffect } from 'react';
import { SiteNav } from '../components/SiteNav';
import { apiFetch } from '../lib/api';
import { KPICard } from '../components/KPICard';
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
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
