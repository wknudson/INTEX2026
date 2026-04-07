import './App.css';
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiFetch } from './lib/api';
import type { UserRole } from './types/auth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/impact" element={<DonorImpactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/portal" element={<PortalPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function SiteNav() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-bold" to="/">
        Havyn
      </Link>
      <div className="navbar-nav">
        <NavLink className="nav-link" to="/privacy">
          Privacy
        </NavLink>
        <NavLink className="nav-link" to="/impact">
          Donor Impact
        </NavLink>
        <NavLink className="nav-link" to="/login">
          Login
        </NavLink>
      </div>
    </nav>
  );
}

function LandingPage() {
  return (
    <>
      <SiteNav />
      <main className="container py-4">
        <h1>Havyn Command Center</h1>
        <p className="lead">
          Unified safehouse operations, donor visibility, and resident-centered decision support.
        </p>
        <CookieBanner />
        <div className="row g-3 mt-3">
          <div className="col-md-4">
            <div className="card p-3 h-100">
              <h5>Resident Safety</h5>
              <p>Track caseload health, incidents, and intervention progress in one place.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 h-100">
              <h5>Donor Trust</h5>
              <p>Connect contributions to safehouse and program outcomes with clear reporting.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 h-100">
              <h5>Actionable ML</h5>
              <p>Highlight at-risk residents and suggest session priorities for social workers.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function PrivacyPolicyPage() {
  return (
    <>
      <SiteNav />
      <main className="container py-4">
        <h1>Privacy Policy</h1>
        <p>
          Havyn processes sensitive child welfare and donor data under strict role-based controls.
          We collect only required operational data, encrypt all credentials, and enforce consent
          for non-essential cookies.
        </p>
        <p>
          Donors and staff can request corrections through authorized administrators. Resident data
          is anonymized in public-facing outputs, and restricted notes are available only to
          approved roles.
        </p>
      </main>
    </>
  );
}

function DonorImpactPage() {
  const [snapshots, setSnapshots] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any[]>('/api/donors/impact').then(setSnapshots).catch(() => setSnapshots([]));
  }, []);

  return (
    <>
      <SiteNav />
      <main className="container py-4">
        <h1>Donor Impact</h1>
        <p className="text-muted">Published monthly snapshots from safehouse operations.</p>
        <div className="row g-3">
          {snapshots.map((snapshot) => (
            <div className="col-md-6" key={snapshot.snapshotId}>
              <div className="card h-100 p-3">
                <h5>{snapshot.headline}</h5>
                <small className="text-muted">{snapshot.snapshotDate}</small>
                <p className="mt-2 mb-0">{snapshot.summaryText}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

function LoginPage() {
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState('admin@havyn.org');
  const [password, setPassword] = useState('TempPass!12345');
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <>
      <SiteNav />
      <main className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card p-4">
              <h1 className="h3">Unified Login</h1>
              <p className="text-muted">All roles authenticate from this screen.</p>
              <label className="form-label mt-2">Email</label>
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label className="form-label mt-2">Password</label>
              <input className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
              {error && <div className="alert alert-danger mt-3">{error}</div>}
              <button
                className="btn btn-primary mt-3"
                disabled={loading}
                onClick={async () => {
                  try {
                    setError('');
                    await login(email, password);
                  } catch (err) {
                    setError((err as Error).message);
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function PortalPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.roles[0] as UserRole;

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-0">Role Portal: {role}</h1>
          <small className="text-muted">{user.displayName}</small>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => logout()}>
          Logout
        </button>
      </div>
      {role === 'ExecutiveAdmin' && <AdminDashboard />}
      {role === 'RegionalManager' && <ManagerDashboard />}
      {role === 'SocialWorker' && <StaffDashboard />}
      {role === 'Donor' && <DonorDashboard />}
    </main>
  );
}

function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    apiFetch('/api/dashboard/admin').then(setOverview).catch(() => null);
  }, []);

  return (
    <div>
      <DashboardMetrics title="Executive Admin" data={overview} />
      <section className="card p-3 mb-3">
        <h5>Global Views</h5>
        <ul>
          <li>Events, Safehouses, Donors, Partners, Reports & Analytics</li>
          <li>CSV exports available from analytics endpoint</li>
        </ul>
      </section>
      <ReportsPanel />
      <PartnersPanel />
      <DonationsPanel />
    </div>
  );
}

function ManagerDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/dashboard/manager').then(setOverview).catch(() => null);
    apiFetch<any>('/api/residents').then((r) => setResidents(r.data ?? [])).catch(() => setResidents([]));
  }, []);

  return (
    <div>
      <DashboardMetrics title="Regional Manager" data={overview} />
      <section className="card p-3 mb-3">
        <h5>Caseload</h5>
        <SimpleTable
          columns={['internalCode', 'caseStatus', 'currentRiskLevel', 'reintegrationStatus']}
          rows={residents}
        />
      </section>
      <PartnersPanel />
      <DonationsPanel />
    </div>
  );
}

function StaffDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [risk, setRisk] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [taskText, setTaskText] = useState('');

  useEffect(() => {
    apiFetch('/api/dashboard/staff').then(setOverview).catch(() => null);
    apiFetch<any[]>('/api/ml/recommended-sessions').then(setRisk).catch(() => setRisk([]));
    apiFetch<any[]>('/api/workplanner/todos').then(setTodos).catch(() => setTodos([]));
  }, []);

  async function addTask() {
    if (!taskText.trim()) return;
    await apiFetch('/api/workplanner/todos', {
      method: 'POST',
      body: JSON.stringify({ taskText }),
    });
    setTaskText('');
    const refreshed = await apiFetch<any[]>('/api/workplanner/todos');
    setTodos(refreshed);
  }

  return (
    <div>
      <DashboardMetrics title="Social Worker" data={overview} />
      <section className="card p-3 mb-3">
        <h5>Recommended Sessions (ML)</h5>
        <SimpleTable columns={['residentId', 'sessionType', 'weeklySessions', 'reason']} rows={risk} />
      </section>
      <section className="card p-3 mb-3">
        <h5>To-Do List</h5>
        <div className="d-flex gap-2 mb-2">
          <input className="form-control" value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Add task" />
          <button className="btn btn-primary" onClick={addTask}>
            Add
          </button>
        </div>
        <ul className="list-group">
          {todos.map((todo) => (
            <li key={todo.todoId} className="list-group-item d-flex justify-content-between">
              <span>{todo.taskText}</span>
              <span className={todo.isCompleted ? 'badge bg-success' : 'badge bg-secondary'}>
                {todo.isCompleted ? 'Done' : 'Open'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DonorDashboard() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    apiFetch('/api/dashboard/donor').then(setOverview).catch(() => null);
  }, []);

  return (
    <div>
      <DashboardMetrics title="Donor" data={overview} />
      <section className="card p-3 mb-3">
        <h5>Manage Donations</h5>
        <p>Use one-time or recurring donations through the portal donation form API.</p>
      </section>
    </div>
  );
}

function ReportsPanel() {
  const [overview, setOverview] = useState<any>(null);
  useEffect(() => {
    apiFetch('/api/reports/overview').then(setOverview).catch(() => null);
  }, []);

  return (
    <section className="card p-3 mb-3">
      <h5>Reports & Analytics</h5>
      {overview ? (
        <div className="row">
          <div className="col-md-3">Active Residents: {overview.totalResidents}</div>
          <div className="col-md-3">High Risk: {overview.highRisk}</div>
          <div className="col-md-3">Total Donations: {overview.totalDonations}</div>
          <div className="col-md-3">Active Partners: {overview.activePartners}</div>
        </div>
      ) : (
        <p className="text-muted">Loading analytics...</p>
      )}
    </section>
  );
}

function DonationsPanel() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    apiFetch<any>('/api/donors/donations').then((r) => setData(r.data ?? [])).catch(() => setData([]));
  }, []);

  return (
    <section className="card p-3 mb-3">
      <h5>Donations</h5>
      <SimpleTable columns={['supporterId', 'donationType', 'donationDate', 'amount', 'estimatedValue']} rows={data} />
    </section>
  );
}

function PartnersPanel() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    apiFetch<any>('/api/partners').then((r) => setData(r.data ?? [])).catch(() => setData([]));
  }, []);

  return (
    <section className="card p-3 mb-3">
      <h5>Partners</h5>
      <SimpleTable columns={['partnerName', 'roleType', 'region', 'status']} rows={data} />
    </section>
  );
}

function DashboardMetrics({ title, data }: { title: string; data: any }) {
  return (
    <section className="card p-3 mb-3">
      <h5>{title} Dashboard</h5>
      {!data && <p className="text-muted">Loading...</p>}
      {data && (
        <div className="d-flex flex-wrap gap-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="metric-pill">
              <strong>{key}</strong>: {String(value)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SimpleTable({ columns, rows }: { columns: string[]; rows: any[] }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 25).map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column}>{String(row[column] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CookieBanner() {
  const [show, setShow] = useState(() => localStorage.getItem('havyn-cookie-choice') === null);

  if (!show) {
    return null;
  }

  return (
    <div className="alert alert-light border d-flex justify-content-between align-items-center mt-3">
      <span>We use essential cookies for secure login and optional cookies for analytics.</span>
      <div className="d-flex gap-2">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => {
            localStorage.setItem('havyn-cookie-choice', 'declined');
            setShow(false);
          }}
        >
          Decline
        </button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            localStorage.setItem('havyn-cookie-choice', 'accepted');
            setShow(false);
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export default App;