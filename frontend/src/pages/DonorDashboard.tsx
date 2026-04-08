import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { TabBar } from '../components/TabBar';
import { DataCard } from '../components/DataCard';
import { KPICard } from '../components/KPICard';
import { DonationBreakdownChart } from '../components/DonationBreakdownChart';
import { ImpactSnapshot } from '../components/ImpactSnapshot';
import { FilterSortTable } from '../components/FilterSortTable';
import '../styles/pages/DonorDashboard.css';

export function DonorDashboard() {
  const [tab, setTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [newDonation, setNewDonation] = useState({ donationType: 'Monetary', donationDate: '', isRecurring: false, channelSource: 'Direct', amount: 0, estimatedValue: 0, campaignName: '', impactUnit: 'pesos' });
  const [message, setMessage] = useState('');

  async function loadDonorData() {
    apiFetch('/api/dashboard/donor').then(setDashboardData).catch(() => setDashboardData(null));
    apiFetch<any>('/api/donors/donations').then((r) => setHistory(r.data ?? [])).catch(() => setHistory([]));
  }

  useEffect(() => { loadDonorData(); }, []);

  async function submitDonation() {
    setMessage('');
    try { await apiFetch('/api/donors/donations', { method: 'POST', body: JSON.stringify(newDonation) }); setMessage('Donation submitted.'); await loadDonorData(); } catch (e) { setMessage((e as Error).message); }
  }

  async function setRecurring(donationId: number, isRecurring: boolean) {
    await apiFetch(`/api/donors/donations/${donationId}/recurring`, { method: 'PUT', body: JSON.stringify({ isRecurring }) });
    await loadDonorData();
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const parseMetrics = (metricsJson: any) => {
    if (!metricsJson) return {};
    if (typeof metricsJson === 'object') return metricsJson;
    try {
      return JSON.parse(metricsJson);
    } catch {
      return {};
    }
  };

  if (!dashboardData) {
    return <div className="text-center p-4"><p className="text-muted">Loading dashboard...</p></div>;
  }

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'history', 'manage']} onSelect={setTab} />
      
      {tab === 'overview' && (
        <>
          {/* KPI Cards Section */}
          <section className="dashboard-section">
            <h4 className="section-title">Your Impact at a Glance</h4>
            <div className="kpi-grid">
              <KPICard
                title="Total Funding"
                value={formatCurrency(dashboardData.myTotal)}
                color="success"
              />
              <KPICard
                title="Donations Made"
                value={dashboardData.myCount}
                unit="times"
                color="primary"
              />
              <KPICard
                title="Recurring Donations"
                value={dashboardData.recurringCount}
                unit="active"
                color="info"
              />
              <KPICard
                title="Lives Helped"
                value={dashboardData.livesHelped}
                unit="residents"
                color="danger"
              />
              <KPICard
                title="Average Donation"
                value={formatCurrency(dashboardData.avgDonation)}
                color="warning"
              />
            </div>
          </section>

          {/* Donation Breakdown Section */}
          <section className="dashboard-section">
            <div className="metrics-row">
              <div className="metrics-column">
                <DataCard title="Donation Types">
                  <DonationBreakdownChart 
                    data={dashboardData.donationsByType} 
                    title="Distribution of Donations"
                  />
                </DataCard>
              </div>
              
              {/* Impact Snapshots */}
              <div className="metrics-column">
                <DataCard title="Recent Impact Updates">
                  <div className="snapshot-container">
                    {dashboardData.lastSnapshots && dashboardData.lastSnapshots.length > 0 ? (
                      dashboardData.lastSnapshots.map((snapshot: any) => (
                        <ImpactSnapshot
                          key={snapshot.snapshotId}
                          headline={snapshot.headline}
                          summaryText={snapshot.summaryText}
                          date={snapshot.snapshotDate}
                          metrics={parseMetrics(snapshot.metricPayloadJson)}
                        />
                      ))
                    ) : (
                      <p className="text-muted">No impact updates available yet</p>
                    )}
                  </div>
                </DataCard>
              </div>
            </div>
          </section>
        </>
      )}

      {tab === 'history' && (
        <DataCard title="Donation History">
          <FilterSortTable columns={['donationId', 'donationDate', 'donationType', 'amount', 'estimatedValue', 'campaignName', 'isRecurring']} rows={history} />
        </DataCard>
      )}

      {tab === 'manage' && (
        <DataCard title="Manage Donations">
          <p className="mb-2">Create one-time or recurring donations. You can also cancel recurring donations below.</p>
          <div className="row g-2">
            <div className="col-md-2"><label className="form-label">Type</label><select className="form-select" value={newDonation.donationType} onChange={(e) => setNewDonation({ ...newDonation, donationType: e.target.value })}><option>Monetary</option><option>InKind</option><option>Time</option><option>Skills</option><option>SocialMedia</option></select></div>
            <div className="col-md-2"><label className="form-label">Date</label><input className="form-control" type="date" value={newDonation.donationDate} onChange={(e) => setNewDonation({ ...newDonation, donationDate: e.target.value })} /></div>
            <div className="col-md-2"><label className="form-label">Amount</label><input className="form-control" type="number" value={newDonation.amount} onChange={(e) => setNewDonation({ ...newDonation, amount: Number(e.target.value) })} /></div>
            <div className="col-md-2"><label className="form-label">Est. Value</label><input className="form-control" type="number" value={newDonation.estimatedValue} onChange={(e) => setNewDonation({ ...newDonation, estimatedValue: Number(e.target.value) })} /></div>
            <div className="col-md-2"><label className="form-label">Campaign</label><input className="form-control" value={newDonation.campaignName} onChange={(e) => setNewDonation({ ...newDonation, campaignName: e.target.value })} /></div>
            <div className="col-md-2"><label className="form-label">Channel</label><select className="form-select" value={newDonation.channelSource} onChange={(e) => setNewDonation({ ...newDonation, channelSource: e.target.value })}><option>Direct</option><option>Campaign</option><option>Event</option><option>SocialMedia</option><option>PartnerReferral</option></select></div>
          </div>
          <div className="form-check mt-2">
            <input className="form-check-input" id="donorRecurring" type="checkbox" checked={newDonation.isRecurring} onChange={(e) => setNewDonation({ ...newDonation, isRecurring: e.target.checked })} />
            <label className="form-check-label" htmlFor="donorRecurring">Recurring donation</label>
          </div>
          <button className="btn btn-primary mt-2" onClick={submitDonation}>Submit Donation</button>
          {message && <p className="mt-2 mb-0">{message}</p>}
          <hr />
          <h6>Recurring Donations</h6>
          {history.filter((x) => x.isRecurring).map((item) => (
            <div key={item.donationId} className="d-flex justify-content-between align-items-center border rounded p-2 mb-2">
              <span>Donation #{item.donationId} ({item.donationDate})</span>
              <button className="btn btn-sm btn-outline-danger" onClick={() => setRecurring(item.donationId, false)}>Cancel Recurring</button>
            </div>
          ))}
          {history.filter((x) => !x.isRecurring).slice(0, 5).map((item) => (
            <div key={item.donationId} className="d-flex justify-content-between align-items-center border rounded p-2 mb-2">
              <span>Donation #{item.donationId} ({item.donationDate})</span>
              <button className="btn btn-sm btn-outline-success" onClick={() => setRecurring(item.donationId, true)}>Mark Recurring</button>
            </div>
          ))}
        </DataCard>
      )}
    </div>
  );
}
