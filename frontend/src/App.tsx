import './App.css';
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
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
          Privacy Policy
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
      <main className="container py-4 pb-5">
        <h1>Havyn Command Center</h1>
        <p className="lead">Simple, secure tracking for residents, donors, and safehouse operations.</p>
        <div className="row g-3 mt-2">
          <InfoCard title="Resident Safety" text="See active cases, risks, and follow-up tasks in one place." />
          <InfoCard title="Donor Trust" text="Track contributions and show impact through clear summaries." />
          <InfoCard title="Team Clarity" text="Keep events, appointments, forms, and to-dos organized." />
        </div>
      </main>
      <CookieBanner />
    </>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="col-md-4">
      <div className="card p-3 h-100">
        <h5>{title}</h5>
        <p className="mb-0">{text}</p>
      </div>
    </div>
  );
}

function PrivacyPolicyPage() {
  return (
    <>
      <SiteNav />
      <main className="container py-4">
        <h1>Havyn Privacy Policy</h1>
        <p>
          Havyn protects donor and resident information with role-based access, secure authentication,
          and strict data minimization. We only collect what is required for care operations, donor
          management, and reporting.
        </p>
        <ul>
          <li>Residents are represented by internal codes in broad list views and public reporting.</li>
          <li>Sensitive case details are visible only to authorized staff roles.</li>
          <li>Public impact pages show aggregated and anonymized outcomes only.</li>
          <li>Users can request data corrections through authorized administrators.</li>
          <li>Cookie consent can be accepted or declined and is stored as a preference.</li>
        </ul>
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

function LoginPage() {
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState('admin@havyn.org');
  const [password, setPassword] = useState('TempPass!12345');
  const [error, setError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  if (user) {
    return <Navigate to="/portal" replace />;
  }

  async function registerDonor() {
    setRegisterMessage('');
    try {
      await apiFetch('/api/auth/register-donor', {
        method: 'POST',
        body: JSON.stringify({
          displayName: newName,
          email: newEmail,
          password: newPassword,
          acceptPrivacyPolicy: acceptPrivacy,
        }),
      });
      setRegisterMessage('Donor account created. You can now log in.');
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setAcceptPrivacy(false);
    } catch (e) {
      setRegisterMessage((e as Error).message);
    }
  }

  return (
    <>
      <SiteNav />
      <main className="container py-4">
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card p-3">
              <h2 className="h4">Unified Login</h2>
              <p className="text-muted">All roles sign in on this page.</p>
              <label className="form-label">Email</label>
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label className="form-label mt-2">Password</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error ? <div className="alert alert-danger mt-2 mb-0">{error}</div> : null}
              <button
                className="btn btn-primary mt-3"
                disabled={loading}
                onClick={async () => {
                  setError('');
                  try {
                    await login(email, password);
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card p-3">
              <h2 className="h4">Donor Sign Up</h2>
              <p className="text-muted">Before donating, create an account.</p>
              <label className="form-label">Display Name</label>
              <input className="form-control" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <label className="form-label mt-2">Email</label>
              <input className="form-control" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <label className="form-label mt-2">Password</label>
              <input
                className="form-control"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <small className="text-muted">Use 12+ chars, uppercase, lowercase, number, and symbol.</small>
              <div className="form-check mt-2">
                <input
                  id="acceptPrivacyPolicy"
                  className="form-check-input"
                  type="checkbox"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                />
                <label htmlFor="acceptPrivacyPolicy" className="form-check-label">
                  I agree to the <Link to="/privacy">Privacy Policy</Link>.
                </label>
              </div>
              <button className="btn btn-outline-primary mt-3" onClick={registerDonor}>
                Create Donor Account
              </button>
              {registerMessage ? <div className="alert alert-info mt-2 mb-0">{registerMessage}</div> : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function PortalPage() {
  const { user, logout, refreshUser } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.roles[0] as UserRole;

  if (role !== 'Donor' && !user.privacyPolicyAccepted) {
    return <FirstViewPage />;
  }

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-0">{role} Portal</h1>
          <small className="text-muted">{user.displayName || user.email}</small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => refreshUser()}>
            Refresh
          </button>
          <button className="btn btn-outline-danger" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </div>
      {role === 'ExecutiveAdmin' && <AdminDashboard />}
      {role === 'RegionalManager' && <ManagerDashboard />}
      {role === 'SocialWorker' && <StaffDashboard />}
      {role === 'Donor' && <DonorDashboard />}
      {!user.cookieConsentAccepted ? <CookieBanner loggedIn /> : null}
    </main>
  );
}

function FirstViewPage() {
  const { refreshUser } = useAuth();
  const [working, setWorking] = useState(false);

  async function acceptAndContinue() {
    setWorking(true);
    try {
      await apiFetch('/api/auth/accept-privacy', { method: 'POST', body: JSON.stringify({ accepted: true }) });
      await apiFetch('/api/auth/accept-cookies', { method: 'POST', body: JSON.stringify({ accepted: true }) });
      await refreshUser();
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="card p-4">
        <h1 className="h4">Welcome to Havyn</h1>
        <p className="mb-2">
          Before continuing, please review and accept the privacy policy and cookie preference.
        </p>
        <p className="mb-3">
          Read policy: <Link to="/privacy">Privacy Policy</Link>
        </p>
        <button className="btn btn-primary" disabled={working} onClick={acceptAndContinue}>
          {working ? 'Saving...' : 'Accept and Continue'}
        </button>
      </div>
    </main>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [safehouses, setSafehouses] = useState<any[]>([]);
  const [supporters, setSupporters] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [includeInactive, setIncludeInactive] = useState(false);

  useEffect(() => {
    apiFetch('/api/dashboard/admin').then(setOverview).catch(() => setOverview(null));
    apiFetch<any>(`/api/safehouses?includeInactive=${includeInactive}`)
      .then((r) => setSafehouses(r.data ?? []))
      .catch(() => setSafehouses([]));
    apiFetch<any>('/api/donors/supporters').then((r) => setSupporters(r.data ?? [])).catch(() => setSupporters([]));
    apiFetch<any>('/api/donors/donations').then((r) => setDonations(r.data ?? [])).catch(() => setDonations([]));
    apiFetch<any>('/api/partners').then((r) => setPartners(r.data ?? [])).catch(() => setPartners([]));
    apiFetch('/api/reports/overview').then(setReport).catch(() => setReport(null));
  }, [includeInactive]);

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'events', 'safehouses', 'donors', 'partners', 'reports']} onSelect={setTab} />
      {tab === 'overview' ? <MetricsCard title="Organization Snapshot" data={overview} /> : null}
      {tab === 'events' ? <BasicEventsCard scope="Admin" /> : null}
      {tab === 'safehouses' ? (
        <DataCard title="Safehouses">
          <div className="form-check mb-2">
            <input id="includeInactive" className="form-check-input" type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
            <label htmlFor="includeInactive" className="form-check-label">Include Inactive</label>
          </div>
          <FilterSortTable columns={['name', 'region', 'currentOccupancy', 'capacityGirls', 'status']} rows={safehouses} />
        </DataCard>
      ) : null}
      {tab === 'donors' ? (
        <>
          <DataCard title="Supporters List">
            <FilterSortTable columns={['displayName', 'supporterType', 'relationshipType', 'region', 'country', 'status', 'acquisitionChannel']} rows={supporters} />
          </DataCard>
          <DataCard title="Donation History">
            <FilterSortTable columns={['donationId', 'supporterId', 'donationType', 'donationDate', 'amount', 'estimatedValue', 'campaignName', 'isRecurring']} rows={donations} />
          </DataCard>
        </>
      ) : null}
      {tab === 'partners' ? (
        <DataCard title="Partners">
          <FilterSortTable columns={['partnerName', 'partnerType', 'roleType', 'region', 'status', 'startDate', 'endDate']} rows={partners} />
        </DataCard>
      ) : null}
      {tab === 'reports' ? (
        <DataCard title="Reports & Analytics">
          <MetricsInline data={report} />
          <a className="btn btn-sm btn-outline-primary mt-2" href="/api/reports/export/donations.csv">
            Export Donations CSV
          </a>
        </DataCard>
      ) : null}
    </div>
  );
}

function ManagerDashboard() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [includeClosed, setIncludeClosed] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState<number | ''>('');
  const [selectedResidentDetail, setSelectedResidentDetail] = useState<any>(null);
  const [reintegrationType, setReintegrationType] = useState('None');
  const [reintegrationStatus, setReintegrationStatus] = useState('Not Started');
  const [actionMessage, setActionMessage] = useState('');

  async function loadManagerData() {
    apiFetch('/api/dashboard/manager').then(setOverview).catch(() => setOverview(null));
    apiFetch<any>(`/api/residents?includeClosed=${includeClosed}`).then((r) => setResidents(r.data ?? [])).catch(() => setResidents([]));
    apiFetch<any>('/api/donors/donations').then((r) => setDonations(r.data ?? [])).catch(() => setDonations([]));
    apiFetch<any>('/api/partners').then((r) => setPartners(r.data ?? [])).catch(() => setPartners([]));
    apiFetch<any>('/api/workplanner/appointments').then((r) => setAppointments(r.data ?? [])).catch(() => setAppointments([]));
    apiFetch<any[]>('/api/reports/safehouse-comparison').then(setConferences).catch(() => setConferences([]));
  }

  useEffect(() => {
    loadManagerData();
  }, [includeClosed]);

  useEffect(() => {
    if (!selectedResidentId) {
      setSelectedResidentDetail(null);
      return;
    }
    apiFetch<any>(`/api/residents/${selectedResidentId}`).then((data) => {
      setSelectedResidentDetail(data);
      setReintegrationType(data.resident?.reintegrationType ?? 'None');
      setReintegrationStatus(data.resident?.reintegrationStatus ?? 'Not Started');
    }).catch(() => setSelectedResidentDetail(null));
  }, [selectedResidentId]);

  async function saveReintegration() {
    if (!selectedResidentId) return;
    await apiFetch(`/api/residents/${selectedResidentId}/reintegration`, {
      method: 'PUT',
      body: JSON.stringify({ reintegrationType, reintegrationStatus }),
    });
    setActionMessage('Reintegration fields updated.');
    await loadManagerData();
  }

  async function closeCase() {
    if (!selectedResidentId) return;
    const ok = window.confirm('Are you sure you want to close this case? This will remove the resident from active caseload views.');
    if (!ok) return;
    await apiFetch(`/api/residents/${selectedResidentId}/close`, { method: 'POST' });
    setActionMessage('Case closed.');
    await loadManagerData();
    setSelectedResidentId('');
  }

  async function reopenCase() {
    if (!selectedResidentId) return;
    const ok = window.confirm('Are you sure you want to reopen this case?');
    if (!ok) return;
    await apiFetch(`/api/residents/${selectedResidentId}/reopen`, { method: 'POST' });
    setActionMessage('Case reopened.');
    await loadManagerData();
    setSelectedResidentId('');
  }

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'events', 'caseload', 'donors', 'appointments', 'partners', 'conferences']} onSelect={setTab} />
      {tab === 'overview' ? <MetricsCard title="Regional Snapshot" data={overview} /> : null}
      {tab === 'events' ? <BasicEventsCard scope="Regional Manager" /> : null}
      {tab === 'caseload' ? (
        <DataCard title="Caseload">
          <div className="form-check mb-2">
            <input id="includeClosedCases" className="form-check-input" type="checkbox" checked={includeClosed} onChange={(e) => setIncludeClosed(e.target.checked)} />
            <label htmlFor="includeClosedCases" className="form-check-label">Include Closed Cases</label>
          </div>
          <FilterSortTable columns={['residentId', 'internalCode', 'caseStatus', 'currentRiskLevel', 'reintegrationStatus', 'assignedSocialWorker']} rows={residents} />
          <hr />
          <label className="form-label">Open Case Profile</label>
          <select className="form-select mb-2" value={selectedResidentId} onChange={(e) => setSelectedResidentId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Select resident</option>
            {residents.map((r) => (
              <option key={r.residentId} value={r.residentId}>
                {r.internalCode} ({r.caseStatus})
              </option>
            ))}
          </select>
          {selectedResidentDetail ? (
            <div className="border rounded p-3">
              <p className="mb-2"><strong>Internal Code:</strong> {selectedResidentDetail.resident.internalCode}</p>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">Reintegration Type</label>
                  <select className="form-select" value={reintegrationType} onChange={(e) => setReintegrationType(e.target.value)}>
                    <option>None</option>
                    <option>Family Reunification</option>
                    <option>Foster Care</option>
                    <option>Adoption (Domestic)</option>
                    <option>Adoption (Inter-Country)</option>
                    <option>Independent Living</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Reintegration Status</label>
                  <select className="form-select" value={reintegrationStatus} onChange={(e) => setReintegrationStatus(e.target.value)}>
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>On Hold</option>
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-primary btn-sm" onClick={saveReintegration}>Save Reintegration</button>
                {selectedResidentDetail.resident.caseStatus === 'Closed' ? (
                  <button className="btn btn-outline-success btn-sm" onClick={reopenCase}>Reopen Case</button>
                ) : (
                  <button className="btn btn-outline-danger btn-sm" onClick={closeCase}>Close Case</button>
                )}
              </div>
              <div className="mt-2 text-muted small">
                Timeline counts: process {selectedResidentDetail.timeline?.processRecordings?.length ?? 0}, home visits {selectedResidentDetail.timeline?.homeVisitations?.length ?? 0}, education {selectedResidentDetail.timeline?.educationRecords?.length ?? 0}, health {selectedResidentDetail.timeline?.healthRecords?.length ?? 0}
              </div>
            </div>
          ) : null}
          {actionMessage ? <p className="mt-2 mb-0">{actionMessage}</p> : null}
        </DataCard>
      ) : null}
      {tab === 'donors' ? (
        <DataCard title="Donations">
          <FilterSortTable columns={['supporterId', 'donationType', 'donationDate', 'amount', 'campaignName', 'channelSource', 'isRecurring']} rows={donations} />
        </DataCard>
      ) : null}
      {tab === 'appointments' ? (
        <DataCard title="Staff Appointments">
          <FilterSortTable columns={['residentId', 'appointmentDate', 'appointmentType', 'sessionFormat', 'status', 'staffUserId']} rows={appointments} />
        </DataCard>
      ) : null}
      {tab === 'partners' ? (
        <DataCard title="Partners">
          <FilterSortTable columns={['partnerName', 'roleType', 'region', 'status', 'startDate', 'endDate']} rows={partners} />
        </DataCard>
      ) : null}
      {tab === 'conferences' ? (
        <DataCard title="Case Conferences">
          <FilterSortTable columns={['safehouseId', 'monthStart', 'monthEnd', 'processRecordingCount', 'incidentCount']} rows={conferences} />
        </DataCard>
      ) : null}
    </div>
  );
}

function StaffDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [riskRows, setRiskRows] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [taskText, setTaskText] = useState('');
  const [formType, setFormType] = useState('intake');
  const [formResult, setFormResult] = useState('');
  const [selectedResidentForForms, setSelectedResidentForForms] = useState<number | ''>('');
  const [formsTimeline, setFormsTimeline] = useState<any>(null);
  const [intake, setIntake] = useState<any>({ safehouseId: 1, caseControlNo: '', internalCode: '', caseCategory: 'Neglected', assignedSocialWorker: user?.displayName ?? '', initialRiskLevel: 'Medium', currentRiskLevel: 'Medium', dateEnrolled: '', reintegrationType: 'None', reintegrationStatus: 'Not Started' });
  const [processForm, setProcessForm] = useState<any>({ residentId: 0, sessionDate: '', socialWorker: user?.displayName ?? '', sessionType: 'Individual', sessionDurationMinutes: 60, emotionalStateObserved: 'Anxious', emotionalStateEnd: 'Calm', sessionNarrative: '', interventionsApplied: '', followUpActions: '', progressNoted: false, concernsFlagged: false, referralMade: false });
  const [homeForm, setHomeForm] = useState<any>({ residentId: 0, visitDate: '', socialWorker: user?.displayName ?? '', visitType: 'Routine Follow-Up', locationVisited: '', familyMembersPresent: '', purpose: '', observations: '', familyCooperationLevel: 'Cooperative', safetyConcernsNoted: false, followUpNeeded: false, followUpNotes: '', visitOutcome: 'Favorable' });
  const [educationForm, setEducationForm] = useState<any>({ residentId: 0, recordDate: '', educationLevel: 'Secondary', schoolName: 'Bridge Program', enrollmentStatus: 'InProgress', attendanceRate: 0.9, progressPercent: 50, completionStatus: 'InProgress', notes: '' });
  const [healthForm, setHealthForm] = useState<any>({ residentId: 0, recordDate: '', generalHealthScore: 3.5, nutritionScore: 3.5, sleepQualityScore: 3.5, energyLevelScore: 3.5, heightCm: 150, weightKg: 45, bmi: 20, medicalCheckupDone: false, dentalCheckupDone: false, psychologicalCheckupDone: false, notes: '' });
  const [planForm, setPlanForm] = useState<any>({ residentId: 0, planCategory: 'Psychosocial', planDescription: '', servicesProvided: 'Healing', targetValue: '', targetDate: '', status: 'Open', caseConferenceDate: '' });
  const [incidentForm, setIncidentForm] = useState<any>({ residentId: 0, safehouseId: 1, incidentDate: '', incidentType: 'Behavioral', severity: 'Low', description: '', responseTaken: '', resolved: false, resolutionDate: '', reportedBy: user?.displayName ?? '', followUpRequired: false });
  const [appointmentForm, setAppointmentForm] = useState<any>({ residentId: 0, appointmentDate: '', appointmentTime: '09:00', appointmentType: 'Healing', sessionFormat: 'Individual', location: '', notes: '', status: 'Scheduled' });

  async function loadStaffData() {
    apiFetch('/api/dashboard/staff').then(setOverview).catch(() => setOverview(null));
    apiFetch<any[]>('/api/ml/recommended-sessions').then(setRiskRows).catch(() => setRiskRows([]));
    apiFetch<any>('/api/residents').then((r) => setResidents(r.data ?? [])).catch(() => setResidents([]));
    apiFetch<any>('/api/workplanner/appointments').then((r) => setAppointments(r.data ?? [])).catch(() => setAppointments([]));
    const todoData = await apiFetch<any[]>('/api/workplanner/todos');
    setTodos(todoData);
  }

  useEffect(() => {
    loadStaffData().catch(() => null);
  }, []);

  useEffect(() => {
    if (!selectedResidentForForms) {
      setFormsTimeline(null);
      return;
    }
    apiFetch<any>(`/api/residents/${selectedResidentForForms}`).then(setFormsTimeline).catch(() => setFormsTimeline(null));
  }, [selectedResidentForForms]);

  async function addTodo() {
    if (!taskText.trim()) return;
    await apiFetch('/api/workplanner/todos', { method: 'POST', body: JSON.stringify({ taskText }) });
    setTaskText('');
    await loadStaffData();
  }

  async function toggleTodo(todoId: number) {
    await apiFetch(`/api/workplanner/todos/${todoId}/toggle`, { method: 'POST' });
    await loadStaffData();
  }

  async function deleteTodo(todoId: number) {
    const ok = window.confirm('Remove this task?');
    if (!ok) return;
    await apiFetch(`/api/workplanner/todos/${todoId}`, { method: 'DELETE' });
    await loadStaffData();
  }

  async function clearCompleted() {
    const ok = window.confirm('Clear completed tasks?');
    if (!ok) return;
    await apiFetch('/api/workplanner/todos/clear-completed', { method: 'DELETE' });
    await loadStaffData();
  }

  async function createAppointment() {
    setFormResult('');
    try {
      await apiFetch('/api/workplanner/appointments', {
        method: 'POST',
        body: JSON.stringify({
          ...appointmentForm,
          staffUserId: user?.id ?? '',
        }),
      });
      setFormResult('Appointment created.');
      await loadStaffData();
    } catch (e) {
      setFormResult((e as Error).message);
    }
  }

  async function submitSelectedForm() {
    setFormResult('');
    try {
      if (formType === 'intake') {
        await apiFetch('/api/forms/intake', { method: 'POST', body: JSON.stringify(intake) });
      }
      if (formType === 'process-recording') {
        await apiFetch('/api/forms/process-recording', { method: 'POST', body: JSON.stringify(processForm) });
      }
      if (formType === 'home-visitation') {
        await apiFetch('/api/forms/home-visitation', { method: 'POST', body: JSON.stringify(homeForm) });
      }
      if (formType === 'education-record') {
        await apiFetch('/api/forms/education-record', { method: 'POST', body: JSON.stringify(educationForm) });
      }
      if (formType === 'health-record') {
        await apiFetch('/api/forms/health-record', { method: 'POST', body: JSON.stringify(healthForm) });
      }
      if (formType === 'intervention-plan') {
        await apiFetch('/api/forms/intervention-plan', { method: 'POST', body: JSON.stringify(planForm) });
      }
      if (formType === 'incident-report') {
        await apiFetch('/api/forms/incident-report', { method: 'POST', body: JSON.stringify(incidentForm) });
      }
      setFormResult('Form submitted. Submitted forms are read-only; submit a new row for corrections.');
      await loadStaffData();
      if (selectedResidentForForms) {
        const timeline = await apiFetch<any>(`/api/residents/${selectedResidentForForms}`);
        setFormsTimeline(timeline);
      }
    } catch (e) {
      setFormResult((e as Error).message);
    }
  }

  const upcomingAppointments = appointments.filter((a) => a.status === 'Scheduled');
  const pastAppointments = appointments.filter((a) => a.status !== 'Scheduled');

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'events', 'caseload', 'forms', 'todos']} onSelect={setTab} />
      {tab === 'overview' ? (
        <>
          <MetricsCard title="Assigned Caseload Snapshot" data={overview} />
          <DataCard title="Recommended Sessions (ML)">
            <FilterSortTable columns={['residentId', 'sessionType', 'weeklySessions', 'reason']} rows={riskRows} />
          </DataCard>
        </>
      ) : null}
      {tab === 'events' ? (
        <DataCard title="Events and Appointments">
          <h6>Upcoming Appointments</h6>
          <FilterSortTable columns={['residentId', 'appointmentDate', 'appointmentTime', 'appointmentType', 'sessionFormat', 'status']} rows={upcomingAppointments} />
          <h6 className="mt-3">Past Appointments</h6>
          <FilterSortTable columns={['residentId', 'appointmentDate', 'appointmentTime', 'appointmentType', 'sessionFormat', 'status']} rows={pastAppointments} />
          <hr />
          <h6>Add Appointment</h6>
          <div className="row g-2">
            <div className="col-md-3">
              <label className="form-label">Resident</label>
              <select className="form-select" value={appointmentForm.residentId} onChange={(e) => setAppointmentForm({ ...appointmentForm, residentId: Number(e.target.value) })}>
                <option value={0}>Select resident</option>
                {residents.map((r) => <option key={r.residentId} value={r.residentId}>{r.internalCode}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input className="form-control" type="date" value={appointmentForm.appointmentDate} onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Time</label>
              <input className="form-control" type="time" value={appointmentForm.appointmentTime} onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentTime: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Type</label>
              <select className="form-select" value={appointmentForm.appointmentType} onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentType: e.target.value })}>
                <option>Healing</option>
                <option>Teaching</option>
                <option>Caring</option>
                <option>Legal Services</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Format</label>
              <select className="form-select" value={appointmentForm.sessionFormat} onChange={(e) => setAppointmentForm({ ...appointmentForm, sessionFormat: e.target.value })}>
                <option>Individual</option>
                <option>Group</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary mt-2" onClick={createAppointment}>Add Appointment</button>
          {formResult ? <p className="mt-2 mb-0">{formResult}</p> : null}
        </DataCard>
      ) : null}
      {tab === 'caseload' ? (
        <DataCard title="Assigned Girls">
          <FilterSortTable columns={['residentId', 'internalCode', 'currentRiskLevel', 'reintegrationStatus', 'caseStatus']} rows={residents} />
        </DataCard>
      ) : null}
      {tab === 'forms' ? (
        <DataCard title="Forms Completed and New Forms">
          <div className="row g-2">
            <div className="col-md-5">
              <label className="form-label">Select Resident (for read-only form history)</label>
              <select className="form-select" value={selectedResidentForForms} onChange={(e) => setSelectedResidentForForms(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Choose resident</option>
                {residents.map((r) => <option key={r.residentId} value={r.residentId}>{r.internalCode}</option>)}
              </select>
            </div>
            <div className="col-md-7">
              <label className="form-label">New Form Type</label>
              <select className="form-select" value={formType} onChange={(e) => setFormType(e.target.value)}>
                <option value="intake">Intake Form</option>
                <option value="process-recording">Process Recording</option>
                <option value="home-visitation">Home Visitation</option>
                <option value="education-record">Education Record</option>
                <option value="health-record">Health & Wellbeing Record</option>
                <option value="intervention-plan">Intervention Plan</option>
                <option value="incident-report">Incident Report</option>
              </select>
            </div>
          </div>
          <hr />
          {formType === 'intake' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Safehouse</label><input className="form-control" type="number" value={intake.safehouseId} onChange={(e) => setIntake({ ...intake, safehouseId: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Case Control No</label><input className="form-control" value={intake.caseControlNo} onChange={(e) => setIntake({ ...intake, caseControlNo: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Internal Code</label><input className="form-control" value={intake.internalCode} onChange={(e) => setIntake({ ...intake, internalCode: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Case Category</label><select className="form-select" value={intake.caseCategory} onChange={(e) => setIntake({ ...intake, caseCategory: e.target.value })}><option>Abandoned</option><option>Foundling</option><option>Surrendered</option><option>Neglected</option></select></div>
              <div className="col-md-4"><label className="form-label">Assigned Staff</label><input className="form-control" value={intake.assignedSocialWorker} onChange={(e) => setIntake({ ...intake, assignedSocialWorker: e.target.value })} /></div>
              <div className="col-md-4"><label className="form-label">Date of Admission</label><input className="form-control" type="date" value={intake.dateEnrolled} onChange={(e) => setIntake({ ...intake, dateEnrolled: e.target.value })} /></div>
              <div className="col-md-2"><label className="form-label">Initial Risk</label><select className="form-select" value={intake.initialRiskLevel} onChange={(e) => setIntake({ ...intake, initialRiskLevel: e.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
              <div className="col-md-2"><label className="form-label">Current Risk</label><select className="form-select" value={intake.currentRiskLevel} onChange={(e) => setIntake({ ...intake, currentRiskLevel: e.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
            </div>
          ) : null}
          {formType === 'process-recording' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><input className="form-control" type="number" value={processForm.residentId} onChange={(e) => setProcessForm({ ...processForm, residentId: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Session Date</label><input className="form-control" type="date" value={processForm.sessionDate} onChange={(e) => setProcessForm({ ...processForm, sessionDate: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Session Type</label><select className="form-select" value={processForm.sessionType} onChange={(e) => setProcessForm({ ...processForm, sessionType: e.target.value })}><option>Individual</option><option>Group</option></select></div>
              <div className="col-md-3"><label className="form-label">Minutes</label><input className="form-control" type="number" value={processForm.sessionDurationMinutes} onChange={(e) => setProcessForm({ ...processForm, sessionDurationMinutes: Number(e.target.value) })} /></div>
              <div className="col-md-6"><label className="form-label">Session Narrative</label><textarea className="form-control" rows={2} value={processForm.sessionNarrative} onChange={(e) => setProcessForm({ ...processForm, sessionNarrative: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label">Interventions Applied</label><textarea className="form-control" rows={2} value={processForm.interventionsApplied} onChange={(e) => setProcessForm({ ...processForm, interventionsApplied: e.target.value })} /></div>
            </div>
          ) : null}
          {formType === 'home-visitation' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><input className="form-control" type="number" value={homeForm.residentId} onChange={(e) => setHomeForm({ ...homeForm, residentId: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Visit Date</label><input className="form-control" type="date" value={homeForm.visitDate} onChange={(e) => setHomeForm({ ...homeForm, visitDate: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Visit Type</label><select className="form-select" value={homeForm.visitType} onChange={(e) => setHomeForm({ ...homeForm, visitType: e.target.value })}><option>Initial Assessment</option><option>Routine Follow-Up</option><option>Reintegration Assessment</option><option>Post-Placement Monitoring</option><option>Emergency</option></select></div>
              <div className="col-md-3"><label className="form-label">Outcome</label><select className="form-select" value={homeForm.visitOutcome} onChange={(e) => setHomeForm({ ...homeForm, visitOutcome: e.target.value })}><option>Favorable</option><option>Needs Improvement</option><option>Unfavorable</option><option>Inconclusive</option></select></div>
              <div className="col-md-6"><label className="form-label">Location</label><input className="form-control" value={homeForm.locationVisited} onChange={(e) => setHomeForm({ ...homeForm, locationVisited: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label">Observations</label><textarea className="form-control" rows={2} value={homeForm.observations} onChange={(e) => setHomeForm({ ...homeForm, observations: e.target.value })} /></div>
            </div>
          ) : null}
          {formType === 'education-record' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><input className="form-control" type="number" value={educationForm.residentId} onChange={(e) => setEducationForm({ ...educationForm, residentId: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Record Date</label><input className="form-control" type="date" value={educationForm.recordDate} onChange={(e) => setEducationForm({ ...educationForm, recordDate: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Program</label><input className="form-control" value={educationForm.schoolName} onChange={(e) => setEducationForm({ ...educationForm, schoolName: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Level</label><select className="form-select" value={educationForm.educationLevel} onChange={(e) => setEducationForm({ ...educationForm, educationLevel: e.target.value })}><option>Primary</option><option>Secondary</option><option>Vocational</option><option>CollegePrep</option></select></div>
              <div className="col-md-4"><label className="form-label">Enrollment</label><select className="form-select" value={educationForm.enrollmentStatus} onChange={(e) => setEducationForm({ ...educationForm, enrollmentStatus: e.target.value })}><option>NotStarted</option><option>InProgress</option><option>Completed</option></select></div>
              <div className="col-md-4"><label className="form-label">Attendance Rate (0-1)</label><input className="form-control" type="number" step="0.01" value={educationForm.attendanceRate} onChange={(e) => setEducationForm({ ...educationForm, attendanceRate: Number(e.target.value) })} /></div>
              <div className="col-md-4"><label className="form-label">Progress %</label><input className="form-control" type="number" value={educationForm.progressPercent} onChange={(e) => setEducationForm({ ...educationForm, progressPercent: Number(e.target.value) })} /></div>
            </div>
          ) : null}
          {formType === 'health-record' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><input className="form-control" type="number" value={healthForm.residentId} onChange={(e) => setHealthForm({ ...healthForm, residentId: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Record Date</label><input className="form-control" type="date" value={healthForm.recordDate} onChange={(e) => setHealthForm({ ...healthForm, recordDate: e.target.value })} /></div>
              <div className="col-md-2"><label className="form-label">Weight</label><input className="form-control" type="number" value={healthForm.weightKg} onChange={(e) => setHealthForm({ ...healthForm, weightKg: Number(e.target.value) })} /></div>
              <div className="col-md-2"><label className="form-label">Height</label><input className="form-control" type="number" value={healthForm.heightCm} onChange={(e) => setHealthForm({ ...healthForm, heightCm: Number(e.target.value) })} /></div>
              <div className="col-md-2"><label className="form-label">BMI</label><input className="form-control" type="number" value={healthForm.bmi} onChange={(e) => setHealthForm({ ...healthForm, bmi: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">General Health</label><input className="form-control" type="number" step="0.1" value={healthForm.generalHealthScore} onChange={(e) => setHealthForm({ ...healthForm, generalHealthScore: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Nutrition</label><input className="form-control" type="number" step="0.1" value={healthForm.nutritionScore} onChange={(e) => setHealthForm({ ...healthForm, nutritionScore: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Sleep</label><input className="form-control" type="number" step="0.1" value={healthForm.sleepQualityScore} onChange={(e) => setHealthForm({ ...healthForm, sleepQualityScore: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Energy</label><input className="form-control" type="number" step="0.1" value={healthForm.energyLevelScore} onChange={(e) => setHealthForm({ ...healthForm, energyLevelScore: Number(e.target.value) })} /></div>
            </div>
          ) : null}
          {formType === 'intervention-plan' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><input className="form-control" type="number" value={planForm.residentId} onChange={(e) => setPlanForm({ ...planForm, residentId: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Category</label><select className="form-select" value={planForm.planCategory} onChange={(e) => setPlanForm({ ...planForm, planCategory: e.target.value })}><option>Safety</option><option>Psychosocial</option><option>Education</option><option>Physical Health</option><option>Legal</option><option>Reintegration</option></select></div>
              <div className="col-md-3"><label className="form-label">Target Date</label><input className="form-control" type="date" value={planForm.targetDate} onChange={(e) => setPlanForm({ ...planForm, targetDate: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Status</label><select className="form-select" value={planForm.status} onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}><option>Open</option><option>In Progress</option><option>Achieved</option><option>On Hold</option><option>Closed</option></select></div>
              <div className="col-md-6"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={planForm.planDescription} onChange={(e) => setPlanForm({ ...planForm, planDescription: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label">Services Provided</label><input className="form-control" value={planForm.servicesProvided} onChange={(e) => setPlanForm({ ...planForm, servicesProvided: e.target.value })} /></div>
            </div>
          ) : null}
          {formType === 'incident-report' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><input className="form-control" type="number" value={incidentForm.residentId} onChange={(e) => setIncidentForm({ ...incidentForm, residentId: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Safehouse</label><input className="form-control" type="number" value={incidentForm.safehouseId} onChange={(e) => setIncidentForm({ ...incidentForm, safehouseId: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Incident Date</label><input className="form-control" type="date" value={incidentForm.incidentDate} onChange={(e) => setIncidentForm({ ...incidentForm, incidentDate: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Type</label><select className="form-select" value={incidentForm.incidentType} onChange={(e) => setIncidentForm({ ...incidentForm, incidentType: e.target.value })}><option>Behavioral</option><option>Medical</option><option>Security</option><option>RunawayAttempt</option><option>SelfHarm</option><option>ConflictWithPeer</option><option>PropertyDamage</option></select></div>
              <div className="col-md-3"><label className="form-label">Severity</label><select className="form-select" value={incidentForm.severity} onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></div>
              <div className="col-md-9"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={incidentForm.description} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} /></div>
            </div>
          ) : null}
          <button className="btn btn-primary mt-2" onClick={submitSelectedForm}>Submit Form</button>
          {formResult ? <p className="mt-2 mb-0">{formResult}</p> : null}
          {formsTimeline ? (
            <div className="mt-3">
              <h6>Read-only Submitted Forms</h6>
              <p className="text-muted mb-2">If a correction is needed, submit a new entry.</p>
              <FilterSortTable columns={['recordType', 'date', 'submittedBy']} rows={flattenTimeline(formsTimeline.timeline)} />
            </div>
          ) : null}
        </DataCard>
      ) : null}
      {tab === 'todos' ? (
        <DataCard title="To-Do List">
          <div className="d-flex gap-2 mb-2">
            <input className="form-control" value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Add a task" />
            <button className="btn btn-primary" onClick={addTodo}>Add</button>
            <button className="btn btn-outline-secondary" onClick={clearCompleted}>Clear Completed</button>
          </div>
          <ul className="list-group">
            {todos.map((todo) => (
              <li key={todo.todoId} className="list-group-item d-flex justify-content-between align-items-center">
                <span className={todo.isCompleted ? 'text-decoration-line-through' : ''}>{todo.taskText}</span>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-success" onClick={() => toggleTodo(todo.todoId)}>
                    {todo.isCompleted ? 'Undo' : 'Done'}
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTodo(todo.todoId)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </DataCard>
      ) : null}
    </div>
  );
}

function DonorDashboard() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [newDonation, setNewDonation] = useState({
    donationType: 'Monetary',
    donationDate: '',
    isRecurring: false,
    channelSource: 'Direct',
    amount: 0,
    estimatedValue: 0,
    campaignName: '',
    impactUnit: 'pesos',
  });
  const [message, setMessage] = useState('');

  async function loadDonorData() {
    apiFetch('/api/dashboard/donor').then(setOverview).catch(() => setOverview(null));
    apiFetch<any>('/api/donors/donations').then((r) => setHistory(r.data ?? [])).catch(() => setHistory([]));
  }

  useEffect(() => {
    loadDonorData();
  }, []);

  async function submitDonation() {
    setMessage('');
    try {
      await apiFetch('/api/donors/donations', {
        method: 'POST',
        body: JSON.stringify(newDonation),
      });
      setMessage('Donation submitted.');
      await loadDonorData();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  async function setRecurring(donationId: number, isRecurring: boolean) {
    await apiFetch(`/api/donors/donations/${donationId}/recurring`, {
      method: 'PUT',
      body: JSON.stringify({ isRecurring }),
    });
    await loadDonorData();
  }

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'history', 'manage']} onSelect={setTab} />
      {tab === 'overview' ? <MetricsCard title="Donor Snapshot" data={overview} /> : null}
      {tab === 'history' ? (
        <DataCard title="Donation History">
          <FilterSortTable columns={['donationId', 'donationDate', 'donationType', 'amount', 'estimatedValue', 'campaignName', 'isRecurring']} rows={history} />
        </DataCard>
      ) : null}
      {tab === 'manage' ? (
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
          {message ? <p className="mt-2 mb-0">{message}</p> : null}
          <hr />
          <h6>Update Existing Recurring Donations</h6>
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
      ) : null}
    </div>
  );
}

function TabBar({ tabs, current, onSelect }: { tabs: string[]; current: string; onSelect: (value: string) => void }) {
  return (
    <div className="simple-tabs mb-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`btn btn-sm ${current === tab ? 'btn-dark' : 'btn-outline-secondary'}`}
          onClick={() => onSelect(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function BasicEventsCard({ scope }: { scope: string }) {
  const events = useMemo(
    () => [
      { date: '2026-04-10', type: 'Team Meeting', status: 'Upcoming' },
      { date: '2026-04-14', type: 'Case Conference', status: 'Upcoming' },
      { date: '2026-03-30', type: 'Fundraising Review', status: 'Past' },
    ],
    [],
  );
  return (
    <DataCard title={`${scope} Events`}>
      <p className="text-muted">Basic calendar/list view placeholder for upcoming and past events.</p>
      <FilterSortTable columns={['date', 'type', 'status']} rows={events} />
    </DataCard>
  );
}

function DataCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card p-3 mb-3">
      <h5>{title}</h5>
      {children}
    </section>
  );
}

function MetricsCard({ title, data }: { title: string; data: any }) {
  return (
    <DataCard title={title}>
      <MetricsInline data={data} />
    </DataCard>
  );
}

function MetricsInline({ data }: { data: any }) {
  if (!data) return <p className="text-muted">Loading...</p>;
  return (
    <div className="d-flex flex-wrap gap-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="metric-pill">
          <strong>{key}</strong>: {String(value)}
        </div>
      ))}
    </div>
  );
}

function FilterSortTable({ columns, rows }: { columns: string[]; rows: any[] }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(columns[0] ?? '');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    setSortBy(columns[0] ?? '');
    setPage(1);
  }, [columns.join('|'), rows.length]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.toLowerCase();
    return rows.filter((row) =>
      columns.some((column) => String(row[column] ?? '').toLowerCase().includes(term)),
    );
  }, [rows, columns, search]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const left = String(a[sortBy] ?? '').toLowerCase();
      const right = String(b[sortBy] ?? '').toLowerCase();
      if (left < right) return sortDir === 'asc' ? -1 : 1;
      if (left > right) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <div className="row g-2 mb-2">
        <div className="col-md-6">
          <input className="form-control form-control-sm" placeholder="Search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="col-md-4">
          <select className="form-select form-select-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {columns.map((column) => <option key={column} value={column}>{column}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
            {sortDir === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-sm table-striped">
          <thead>
            <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i}>
                {columns.map((column) => (
                  <td key={column}>{String(row[column] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">Showing page {currentPage} of {totalPages}</small>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Prev</button>
          <button className="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}

function flattenTimeline(timeline: any) {
  const rows: any[] = [];
  (timeline?.processRecordings ?? []).forEach((x: any) => rows.push({ recordType: 'Process Recording', date: x.sessionDate, submittedBy: x.socialWorker }));
  (timeline?.homeVisitations ?? []).forEach((x: any) => rows.push({ recordType: 'Home Visitation', date: x.visitDate, submittedBy: x.socialWorker }));
  (timeline?.educationRecords ?? []).forEach((x: any) => rows.push({ recordType: 'Education Record', date: x.recordDate, submittedBy: 'Staff' }));
  (timeline?.healthRecords ?? []).forEach((x: any) => rows.push({ recordType: 'Health Record', date: x.recordDate, submittedBy: 'Staff' }));
  (timeline?.interventionPlans ?? []).forEach((x: any) => rows.push({ recordType: 'Intervention Plan', date: x.targetDate, submittedBy: 'Staff' }));
  (timeline?.incidents ?? []).forEach((x: any) => rows.push({ recordType: 'Incident Report', date: x.incidentDate, submittedBy: x.reportedBy }));
  return rows;
}

function readCookie(name: string) {
  const match = document.cookie.split('; ').find((value) => value.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

function CookieBanner({ loggedIn = false }: { loggedIn?: boolean }) {
  const { user, refreshUser } = useAuth();
  const [closed, setClosed] = useState(false);
  const consent = readCookie('havyn_cookie_choice');

  if (closed || consent) return null;

  async function saveChoice(accepted: boolean) {
    writeCookie('havyn_cookie_choice', accepted ? 'accepted' : 'declined');
    if (loggedIn && user) {
      await apiFetch('/api/auth/accept-cookies', {
        method: 'POST',
        body: JSON.stringify({ accepted }),
      });
      await refreshUser();
    }
    setClosed(true);
  }

  return (
    <div className="cookie-banner shadow-sm">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div>
          <strong>Cookie Preference</strong>
          <p className="mb-0">We use essential cookies for login and optional cookies for non-essential features.</p>
        </div>
        <button className="btn btn-sm btn-light border" onClick={() => setClosed(true)}>x</button>
      </div>
      <div className="d-flex gap-2 mt-2">
        <button className="btn btn-sm btn-outline-light" onClick={() => saveChoice(false)}>Decline</button>
        <button className="btn btn-sm btn-light" onClick={() => saveChoice(true)}>Accept</button>
      </div>
    </div>
  );
}

export default App;