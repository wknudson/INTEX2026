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

/* ─── Shared Nav ─── */
function SiteNav() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-bold" to="/">Havyn</Link>
      <div className="navbar-nav">
        <NavLink className="nav-link" to="/privacy">Privacy Policy</NavLink>
        <NavLink className="nav-link" to="/impact">Donor Impact</NavLink>
        <NavLink className="nav-link" to="/login">Login</NavLink>
      </div>
    </nav>
  );
}

/* ─── Landing Page ─── */
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

/* ─── Privacy Policy (GDPR) ─── */
function PrivacyPolicyPage() {
  return (
    <>
      <SiteNav />
      <main className="container py-4" style={{ maxWidth: 800 }}>
        <h1>Privacy Policy</h1>
        <p><em>Last updated: April 2026</em></p>

        <h4>1. Data Controller</h4>
        <p>Havyn Safehouse Foundation, Inc. ("Havyn", "we", "us") is a 501(c)(3) nonprofit organization headquartered in Cebu City, Philippines. We operate safehouses that protect and rehabilitate girls who are survivors of abuse and trafficking. For questions about this policy, contact us at privacy@havyn.org.</p>

        <h4>2. What Data We Collect</h4>
        <p>We collect the minimum data necessary to provide our services:</p>
        <ul>
          <li><strong>Donor accounts:</strong> name, email, country, and donation history.</li>
          <li><strong>Staff accounts:</strong> name, email, role, and safehouse assignment.</li>
          <li><strong>Resident records:</strong> anonymized case identifiers, health and education progress scores, incident reports, and care plans. Identifying demographic information is restricted to authorized staff only.</li>
          <li><strong>Technical data:</strong> session cookies for authentication, cookie consent preference.</li>
        </ul>

        <h4>3. Legal Basis for Processing</h4>
        <p>We process personal data based on: (a) your consent when you create an account and accept this policy; (b) legitimate interest in operating child protection services; (c) legal obligations related to child welfare reporting.</p>

        <h4>4. How We Use Your Data</h4>
        <ul>
          <li>To provide secure access to the Havyn platform based on your role.</li>
          <li>To track care outcomes and ensure no child falls through the cracks.</li>
          <li>To report aggregated, anonymized impact metrics to donors and the public.</li>
          <li>To process and acknowledge donations.</li>
        </ul>

        <h4>5. Data Sharing</h4>
        <p>We do not sell or share personal data with third parties for marketing. We may share data with: (a) government agencies as required by Philippine child welfare law; (b) partner organizations for service delivery, under data processing agreements; (c) law enforcement when legally required.</p>

        <h4>6. Data Retention</h4>
        <p>Donor records are retained for 7 years after the last donation for tax and audit purposes. Resident case records are retained for 10 years after case closure per Philippine social welfare regulations. Staff account data is retained for the duration of employment plus 3 years.</p>

        <h4>7. Your Rights</h4>
        <p>Under the Philippine Data Privacy Act (RA 10173) and GDPR where applicable, you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data (subject to legal retention requirements).</li>
          <li>Object to processing of your data.</li>
          <li>Data portability — receive your data in a structured format.</li>
          <li>Withdraw consent at any time.</li>
        </ul>
        <p>To exercise any of these rights, email privacy@havyn.org. We will respond within 30 days.</p>

        <h4>8. Cookies</h4>
        <p>We use one essential cookie (<code>havyn.auth</code>) for login sessions. If you accept optional cookies, we store your consent preference in a <code>havyn_cookie_choice</code> cookie. No analytics or tracking cookies are used unless you consent.</p>

        <h4>9. Security</h4>
        <p>All data is transmitted over HTTPS/TLS. Passwords are hashed with PBKDF2 (HMAC-SHA256, 128-bit salt, 10,000 iterations). Role-based access control ensures staff only see data relevant to their responsibilities. Content Security Policy headers protect against XSS and injection attacks.</p>

        <h4>10. Changes to This Policy</h4>
        <p>We will notify users of material changes via the platform and update the "Last updated" date. Continued use after changes constitutes acceptance.</p>

        <h4>11. Contact</h4>
        <p>Havyn Safehouse Foundation, Inc.<br/>Cebu City, Philippines<br/>Email: privacy@havyn.org</p>
      </main>
    </>
  );
}

/* ─── Donor Impact (Public) ─── */
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

/* ─── Login Page with MFA ─── */
function LoginPage() {
  const { user, login, validateMfa, loading, mfaRequired } = useAuth();
  const [email, setEmail] = useState('admin@havyn.org');
  const [password, setPassword] = useState('TempPass!12345');
  const [error, setError] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  if (user) return <Navigate to="/portal" replace />;

  if (mfaRequired) {
    return (
      <>
        <SiteNav />
        <main className="container py-4" style={{ maxWidth: 400 }}>
          <div className="card p-3">
            <h2 className="h4">MFA Verification</h2>
            <p className="text-muted">Enter the 6-digit code from your authenticator app.</p>
            <input className="form-control" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="123456" maxLength={6} />
            {error ? <div className="alert alert-danger mt-2 mb-0">{error}</div> : null}
            <button className="btn btn-primary mt-3" disabled={loading} onClick={async () => {
              setError('');
              try { await validateMfa(mfaCode); } catch (e) { setError((e as Error).message); }
            }}>{loading ? 'Verifying...' : 'Verify'}</button>
          </div>
        </main>
      </>
    );
  }

  async function registerDonor() {
    setRegisterMessage('');
    try {
      await apiFetch('/api/auth/register-donor', {
        method: 'POST',
        body: JSON.stringify({ displayName: newName, email: newEmail, password: newPassword, acceptPrivacyPolicy: acceptPrivacy }),
      });
      setRegisterMessage('Donor account created. You can now log in.');
      setNewName(''); setNewEmail(''); setNewPassword(''); setAcceptPrivacy(false);
    } catch (e) { setRegisterMessage((e as Error).message); }
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
              <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error ? <div className="alert alert-danger mt-2 mb-0">{error}</div> : null}
              <button className="btn btn-primary mt-3" disabled={loading} onClick={async () => {
                setError('');
                try { await login(email, password); } catch (e) { setError((e as Error).message); }
              }}>{loading ? 'Signing in...' : 'Sign In'}</button>
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
              <input className="form-control" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <small className="text-muted">Use 12+ chars, uppercase, lowercase, number, and symbol.</small>
              <div className="form-check mt-2">
                <input id="acceptPrivacyPolicy" className="form-check-input" type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} />
                <label htmlFor="acceptPrivacyPolicy" className="form-check-label">I agree to the <Link to="/privacy">Privacy Policy</Link>.</label>
              </div>
              <button className="btn btn-outline-primary mt-3" onClick={registerDonor}>Create Donor Account</button>
              {registerMessage ? <div className="alert alert-info mt-2 mb-0">{registerMessage}</div> : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/* ─── Portal ─── */
function PortalPage() {
  const { user, logout, refreshUser } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.roles[0] as UserRole;

  if (role !== 'Donor' && !user.privacyPolicyAccepted) return <FirstViewPage />;

  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-0">{role} Portal</h1>
          <small className="text-muted">{user.displayName || user.email}</small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => refreshUser()}>Refresh</button>
          <button className="btn btn-outline-danger" onClick={() => logout()}>Logout</button>
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
    } finally { setWorking(false); }
  }
  return (
    <main className="container py-5">
      <div className="card p-4">
        <h1 className="h4">Welcome to Havyn</h1>
        <p className="mb-2">Before continuing, please review and accept the privacy policy and cookie preference.</p>
        <p className="mb-3">Read policy: <Link to="/privacy">Privacy Policy</Link></p>
        <button className="btn btn-primary" disabled={working} onClick={acceptAndContinue}>{working ? 'Saving...' : 'Accept and Continue'}</button>
      </div>
    </main>
  );
}

/* ════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ════════════════════════════════════════════════════════════════ */
function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [safehouses, setSafehouses] = useState<any[]>([]);
  const [supporters, setSupporters] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [residentOutcomes, setResidentOutcomes] = useState<any>(null);
  const [servicesProvided, setServicesProvided] = useState<any>(null);
  const [safehouseComparison, setSafehouseComparison] = useState<any>(null);
  const [donationTrends, setDonationTrends] = useState<any>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [includeClosedReports, setIncludeClosedReports] = useState(false);

  // Safehouse detail
  const [selectedSafehouseId, setSelectedSafehouseId] = useState<number | ''>('');
  const [safehouseDetail, setSafehouseDetail] = useState<any>(null);

  // Partner detail
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | ''>('');
  const [partnerAssignments, setPartnerAssignments] = useState<any[]>([]);

  // Supporter create/edit
  const [showSupporterForm, setShowSupporterForm] = useState(false);
  const [editingSupporterId, setEditingSupporterId] = useState<number | null>(null);
  const [supporterForm, setSupporterForm] = useState<any>({ displayName: '', supporterType: 'MonetaryDonor', relationshipType: 'Local', region: '', country: 'Philippines', email: '', phone: '', status: 'Active', acquisitionChannel: 'Website' });
  const [supporterMsg, setSupporterMsg] = useState('');

  // Partner create/edit
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<number | null>(null);
  const [partnerForm, setPartnerForm] = useState<any>({ partnerName: '', partnerType: '', roleType: '', contactName: '', email: '', phone: '', region: '', status: 'Active', notes: '' });
  const [partnerMsg, setPartnerMsg] = useState('');

  // Account creation
  const [acctEmail, setAcctEmail] = useState('');
  const [acctPassword, setAcctPassword] = useState('');
  const [acctName, setAcctName] = useState('');
  const [acctRole, setAcctRole] = useState('RegionalManager');
  const [acctMsg, setAcctMsg] = useState('');

  // Event creation
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState<any>({ residentId: 0, eventDate: '', eventTime: '09:00', eventTypeChoice: 'Meeting', customEventType: '', eventName: '', notes: '' });
  const [eventMsg, setEventMsg] = useState('');

  async function loadAdminData() {
    apiFetch('/api/dashboard/admin').then(setOverview).catch(() => setOverview(null));
    apiFetch<any>(`/api/safehouses?includeInactive=${includeInactive}`).then((r) => setSafehouses(r.data ?? [])).catch(() => setSafehouses([]));
    apiFetch<any>('/api/donors/supporters').then((r) => setSupporters(r.data ?? [])).catch(() => setSupporters([]));
    apiFetch<any>('/api/donors/donations').then((r) => setDonations(r.data ?? [])).catch(() => setDonations([]));
    apiFetch<any>('/api/partners').then((r) => setPartners(r.data ?? [])).catch(() => setPartners([]));
    apiFetch<any>('/api/workplanner/appointments?page=1&pageSize=500').then((r) => setAppointments(r.data ?? [])).catch(() => setAppointments([]));
    apiFetch(`/api/reports/overview?includeClosedCases=${includeClosedReports}`).then(setReport).catch(() => setReport(null));
    apiFetch(`/api/reports/resident-outcomes?includeClosedCases=${includeClosedReports}`).then(setResidentOutcomes).catch(() => setResidentOutcomes(null));
    apiFetch('/api/reports/services-provided').then(setServicesProvided).catch(() => setServicesProvided(null));
    apiFetch('/api/reports/safehouse-comparison').then(setSafehouseComparison).catch(() => setSafehouseComparison(null));
    apiFetch('/api/reports/donation-trends').then(setDonationTrends).catch(() => setDonationTrends(null));
  }

  useEffect(() => { loadAdminData(); }, [includeInactive, includeClosedReports]);

  useEffect(() => {
    if (!selectedSafehouseId) { setSafehouseDetail(null); return; }
    apiFetch<any>(`/api/safehouses/${selectedSafehouseId}`).then(setSafehouseDetail).catch(() => setSafehouseDetail(null));
  }, [selectedSafehouseId]);

  useEffect(() => {
    if (!selectedPartnerId) { setPartnerAssignments([]); return; }
    apiFetch<any[]>(`/api/partners/${selectedPartnerId}/assignments`).then(setPartnerAssignments).catch(() => setPartnerAssignments([]));
  }, [selectedPartnerId]);

  async function saveSupporter() {
    setSupporterMsg('');
    try {
      if (editingSupporterId) {
        await apiFetch(`/api/donors/supporters/${editingSupporterId}`, { method: 'PUT', body: JSON.stringify(supporterForm) });
        setSupporterMsg('Supporter updated.');
      } else {
        await apiFetch('/api/donors/supporters', { method: 'POST', body: JSON.stringify(supporterForm) });
        setSupporterMsg('Supporter created.');
      }
      setShowSupporterForm(false);
      setEditingSupporterId(null);
      await loadAdminData();
    } catch (e) { setSupporterMsg((e as Error).message); }
  }

  async function savePartner() {
    setPartnerMsg('');
    try {
      if (editingPartnerId) {
        await apiFetch(`/api/partners/${editingPartnerId}`, { method: 'PUT', body: JSON.stringify(partnerForm) });
        setPartnerMsg('Partner updated.');
      } else {
        await apiFetch('/api/partners', { method: 'POST', body: JSON.stringify(partnerForm) });
        setPartnerMsg('Partner created.');
      }
      setShowPartnerForm(false);
      setEditingPartnerId(null);
      await loadAdminData();
    } catch (e) { setPartnerMsg((e as Error).message); }
  }

  async function createAccount() {
    setAcctMsg('');
    try {
      await apiFetch('/api/auth/create-account', { method: 'POST', body: JSON.stringify({ email: acctEmail, password: acctPassword, displayName: acctName, role: acctRole }) });
      setAcctMsg(`${acctRole} account created.`);
      setAcctEmail(''); setAcctPassword(''); setAcctName('');
    } catch (e) { setAcctMsg((e as Error).message); }
  }

  async function saveAdminEvent() {
    setEventMsg('');
    if (!eventForm.eventDate) { setEventMsg('Date is required.'); return; }
    const eventType = eventForm.eventTypeChoice === 'Custom' ? eventForm.customEventType : eventForm.eventTypeChoice;
    const eventName = eventForm.eventName || eventType;
    try {
      await apiFetch('/api/workplanner/appointments', { method: 'POST', body: JSON.stringify({ residentId: eventForm.residentId || 0, eventName, appointmentDate: eventForm.eventDate, appointmentTime: eventForm.eventTime, appointmentType: eventType, sessionFormat: 'Individual', notes: eventForm.notes, status: 'Scheduled' }) });
      setEventMsg('Event created.');
      setShowEventModal(false);
      await loadAdminData();
    } catch (e) { setEventMsg((e as Error).message); }
  }

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'schedule', 'safehouses', 'donors', 'partners', 'reports']} onSelect={setTab} />

      {tab === 'overview' ? (
        <>
          <MetricsCard title="Organization Snapshot" data={overview} />
          <DataCard title="Create Staff Account">
            <div className="row g-2">
              <div className="col-md-3"><input className="form-control" placeholder="Display Name" value={acctName} onChange={(e) => setAcctName(e.target.value)} /></div>
              <div className="col-md-3"><input className="form-control" placeholder="Email" value={acctEmail} onChange={(e) => setAcctEmail(e.target.value)} /></div>
              <div className="col-md-2"><input className="form-control" type="password" placeholder="Password (12+ chars)" value={acctPassword} onChange={(e) => setAcctPassword(e.target.value)} /></div>
              <div className="col-md-2"><select className="form-select" value={acctRole} onChange={(e) => setAcctRole(e.target.value)}><option>ExecutiveAdmin</option><option>RegionalManager</option><option>SocialWorker</option></select></div>
              <div className="col-md-2"><button className="btn btn-primary w-100" onClick={createAccount}>Create</button></div>
            </div>
            {acctMsg ? <p className="mt-2 mb-0">{acctMsg}</p> : null}
          </DataCard>
        </>
      ) : null}

      {tab === 'schedule' ? (
        <DataCard title="Admin Schedule">
          <ScheduleCalendar title="Admin Schedule" appointments={appointments} residents={[]}
            onAddEvent={() => { setShowEventModal(true); setEventForm({ residentId: 0, eventDate: '', eventTime: '09:00', eventTypeChoice: 'Meeting', customEventType: '', eventName: '', notes: '' }); }} />
          {showEventModal ? (
            <div className="event-modal-backdrop"><div className="event-modal-card">
              <h5 className="mb-2">Add Event</h5>
              <div className="row g-2">
                <div className="col-md-4"><label className="form-label">Date</label><input className="form-control" type="date" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Time</label><input className="form-control" type="time" value={eventForm.eventTime} onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Type</label><select className="form-select" value={eventForm.eventTypeChoice} onChange={(e) => setEventForm({ ...eventForm, eventTypeChoice: e.target.value })}><option>Meeting</option><option>Speaking Event</option><option>Charity Event</option><option>Marketing</option><option>Awareness</option><option>Custom</option></select></div>
              </div>
              {eventForm.eventTypeChoice === 'Custom' ? <div className="mt-2"><input className="form-control" placeholder="Custom event type" value={eventForm.customEventType} onChange={(e) => setEventForm({ ...eventForm, customEventType: e.target.value })} /></div> : null}
              <div className="mt-2"><input className="form-control" placeholder="Event name" value={eventForm.eventName} onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })} /></div>
              <div className="mt-2"><textarea className="form-control" rows={2} placeholder="Notes" value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })} /></div>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-secondary" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveAdminEvent}>Save</button>
              </div>
              {eventMsg ? <p className="mt-2 mb-0">{eventMsg}</p> : null}
            </div></div>
          ) : null}
        </DataCard>
      ) : null}

      {tab === 'safehouses' ? (
        <DataCard title="Safehouses">
          <div className="form-check mb-2">
            <input id="includeInactive" className="form-check-input" type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
            <label htmlFor="includeInactive" className="form-check-label">Include Inactive</label>
          </div>
          <FilterSortTable columns={['safehouseId', 'name', 'region', 'currentOccupancy', 'capacityGirls', 'status']} rows={safehouses} onRowClick={(row) => setSelectedSafehouseId(row.safehouseId)} />
          {safehouseDetail ? (
            <div className="border rounded p-3 mt-3">
              <div className="d-flex justify-content-between">
                <h6>{safehouseDetail.safehouse.name}</h6>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedSafehouseId('')}>Close</button>
              </div>
              <p>Region: {safehouseDetail.safehouse.region} | City: {safehouseDetail.safehouse.city} | Active Residents: {safehouseDetail.residentCount} | Unresolved Incidents: {safehouseDetail.unresolvedIncidents}</p>
              {safehouseDetail.metrics?.length > 0 ? (
                <FilterSortTable columns={['monthStart', 'monthEnd', 'activeResidents', 'avgEducationProgress', 'avgHealthScore', 'processRecordingCount', 'incidentCount']} rows={safehouseDetail.metrics} />
              ) : <p className="text-muted">No monthly metrics yet.</p>}
            </div>
          ) : null}
        </DataCard>
      ) : null}

      {tab === 'donors' ? (
        <>
          <DataCard title="Supporters">
            <button className="btn btn-sm btn-primary mb-2" onClick={() => { setShowSupporterForm(true); setEditingSupporterId(null); setSupporterForm({ displayName: '', supporterType: 'MonetaryDonor', relationshipType: 'Local', region: '', country: 'Philippines', email: '', phone: '', status: 'Active', acquisitionChannel: 'Website' }); }}>New Supporter</button>
            <FilterSortTable columns={['supporterId', 'displayName', 'supporterType', 'relationshipType', 'region', 'country', 'status', 'acquisitionChannel']} rows={supporters}
              onRowClick={(row) => { setEditingSupporterId(row.supporterId); setSupporterForm({ ...row }); setShowSupporterForm(true); }} />
            {supporterMsg ? <p className="mt-2 mb-0">{supporterMsg}</p> : null}
          </DataCard>
          {showSupporterForm ? (
            <DataCard title={editingSupporterId ? 'Edit Supporter' : 'New Supporter'}>
              <div className="row g-2">
                <div className="col-md-3"><label className="form-label">Display Name</label><input className="form-control" value={supporterForm.displayName} onChange={(e) => setSupporterForm({ ...supporterForm, displayName: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Type</label><select className="form-select" value={supporterForm.supporterType} onChange={(e) => setSupporterForm({ ...supporterForm, supporterType: e.target.value })}><option>MonetaryDonor</option><option>InKindDonor</option><option>Volunteer</option><option>SkillsContributor</option><option>SocialMediaAdvocate</option><option>PartnerOrganization</option></select></div>
                <div className="col-md-3"><label className="form-label">Relationship</label><select className="form-select" value={supporterForm.relationshipType} onChange={(e) => setSupporterForm({ ...supporterForm, relationshipType: e.target.value })}><option>Local</option><option>International</option><option>PartnerOrganization</option></select></div>
                <div className="col-md-3"><label className="form-label">Email</label><input className="form-control" value={supporterForm.email} onChange={(e) => setSupporterForm({ ...supporterForm, email: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Country</label><input className="form-control" value={supporterForm.country} onChange={(e) => setSupporterForm({ ...supporterForm, country: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Region</label><input className="form-control" value={supporterForm.region || ''} onChange={(e) => setSupporterForm({ ...supporterForm, region: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Channel</label><select className="form-select" value={supporterForm.acquisitionChannel} onChange={(e) => setSupporterForm({ ...supporterForm, acquisitionChannel: e.target.value })}><option>Website</option><option>SocialMedia</option><option>Event</option><option>WordOfMouth</option><option>PartnerReferral</option><option>Church</option></select></div>
                <div className="col-md-3"><label className="form-label">Status</label><select className="form-select" value={supporterForm.status} onChange={(e) => setSupporterForm({ ...supporterForm, status: e.target.value })}><option>Active</option><option>Inactive</option></select></div>
              </div>
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-primary" onClick={saveSupporter}>Save</button>
                <button className="btn btn-outline-secondary" onClick={() => setShowSupporterForm(false)}>Cancel</button>
              </div>
            </DataCard>
          ) : null}
          <DataCard title="Donation History">
            <FilterSortTable columns={['donationId', 'supporterId', 'donationType', 'donationDate', 'amount', 'estimatedValue', 'campaignName', 'isRecurring']} rows={donations} />
          </DataCard>
        </>
      ) : null}

      {tab === 'partners' ? (
        <DataCard title="Partners">
          <button className="btn btn-sm btn-primary mb-2" onClick={() => { setShowPartnerForm(true); setEditingPartnerId(null); setPartnerForm({ partnerName: '', partnerType: '', roleType: '', contactName: '', email: '', phone: '', region: '', status: 'Active', notes: '' }); }}>New Partner</button>
          <FilterSortTable columns={['partnerId', 'partnerName', 'partnerType', 'roleType', 'region', 'status', 'startDate', 'endDate']} rows={partners}
            onRowClick={(row) => { setSelectedPartnerId(row.partnerId); setEditingPartnerId(row.partnerId); setPartnerForm({ ...row }); setShowPartnerForm(true); }} />
          {showPartnerForm ? (
            <div className="border rounded p-3 mt-2">
              <h6>{editingPartnerId ? 'Edit Partner' : 'New Partner'}</h6>
              <div className="row g-2">
                <div className="col-md-3"><label className="form-label">Name</label><input className="form-control" value={partnerForm.partnerName} onChange={(e) => setPartnerForm({ ...partnerForm, partnerName: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Type</label><input className="form-control" value={partnerForm.partnerType} onChange={(e) => setPartnerForm({ ...partnerForm, partnerType: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Role</label><input className="form-control" value={partnerForm.roleType} onChange={(e) => setPartnerForm({ ...partnerForm, roleType: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Contact</label><input className="form-control" value={partnerForm.contactName} onChange={(e) => setPartnerForm({ ...partnerForm, contactName: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Email</label><input className="form-control" value={partnerForm.email} onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Region</label><input className="form-control" value={partnerForm.region} onChange={(e) => setPartnerForm({ ...partnerForm, region: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Status</label><select className="form-select" value={partnerForm.status} onChange={(e) => setPartnerForm({ ...partnerForm, status: e.target.value })}><option>Active</option><option>Inactive</option></select></div>
              </div>
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-primary" onClick={savePartner}>Save</button>
                <button className="btn btn-outline-secondary" onClick={() => setShowPartnerForm(false)}>Cancel</button>
              </div>
              {partnerMsg ? <p className="mt-2 mb-0">{partnerMsg}</p> : null}
            </div>
          ) : null}
          {selectedPartnerId ? (
            <div className="border rounded p-3 mt-2">
              <div className="d-flex justify-content-between"><h6>Assignments</h6><button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedPartnerId('')}>Close</button></div>
              {partnerAssignments.length === 0 ? <p className="text-muted">No assignments.</p> : (
                <FilterSortTable columns={['safehouseId', 'programArea', 'assignmentStart', 'assignmentEnd', 'isPrimary', 'status']} rows={partnerAssignments} />
              )}
            </div>
          ) : null}
        </DataCard>
      ) : null}

      {tab === 'reports' ? (
        <>
          <div className="form-check mb-3">
            <input id="includeClosedReports" className="form-check-input" type="checkbox" checked={includeClosedReports} onChange={(e) => setIncludeClosedReports(e.target.checked)} />
            <label htmlFor="includeClosedReports" className="form-check-label">Include Closed Cases</label>
          </div>

          {/* SECTION 1: RESIDENT OUTCOMES */}
          <DataCard title="Resident Outcomes">
            <MetricsInline data={report} />
            {residentOutcomes ? (
              <>
                <h6 className="mt-3">By Safehouse</h6>
                <FilterSortTable columns={['safehouseId', 'count']} rows={residentOutcomes.bySafehouse ?? []} />
                <h6 className="mt-3">By Case Category</h6>
                <FilterSortTable columns={['category', 'count']} rows={residentOutcomes.byCategory ?? []} />
                <h6 className="mt-3">By Risk Level</h6>
                <FilterSortTable columns={['riskLevel', 'count']} rows={residentOutcomes.byRiskLevel ?? []} />
                <h6 className="mt-3">Average Education Progress by Safehouse</h6>
                <FilterSortTable columns={['safehouseId', 'avgProgress']} rows={residentOutcomes.eduBySafehouse ?? []} />
                <h6 className="mt-3">Average Health Score by Safehouse</h6>
                <FilterSortTable columns={['safehouseId', 'avgHealth']} rows={residentOutcomes.healthBySafehouse ?? []} />
                <h6 className="mt-3">Reintegration Success</h6>
                <p className="text-muted mb-1">Completed: {residentOutcomes.reintegrationCompletedTotal} of {residentOutcomes.totalForReintegration} started ({residentOutcomes.totalForReintegration > 0 ? Math.round(residentOutcomes.reintegrationCompletedTotal / residentOutcomes.totalForReintegration * 100) : 0}%)</p>
                <FilterSortTable columns={['type', 'count']} rows={residentOutcomes.reintegration ?? []} />
                <h6 className="mt-3">Closed Cases by Month</h6>
                {(residentOutcomes.closedByMonth ?? []).length === 0 ? <p className="text-muted">No closed cases.</p> : (
                  <FilterSortTable columns={['year', 'month', 'count']} rows={residentOutcomes.closedByMonth} />
                )}
              </>
            ) : <p className="text-muted">Loading...</p>}
          </DataCard>

          {/* SECTION 2: SERVICES PROVIDED */}
          <DataCard title="Services Provided">
            {servicesProvided ? (
              <>
                <h6>Caring (Home Visitations)</h6>
                <div className="row">
                  <div className="col-md-6">
                    <p className="text-muted mb-1">By Visit Type</p>
                    <FilterSortTable columns={['visitType', 'count']} rows={servicesProvided.caring ?? []} />
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted mb-1">By Outcome</p>
                    <FilterSortTable columns={['outcome', 'count']} rows={servicesProvided.caringByOutcome ?? []} />
                  </div>
                </div>
                <h6 className="mt-3">Healing (Process Recordings / Counseling)</h6>
                <FilterSortTable columns={['sessionType', 'count']} rows={servicesProvided.healingByType ?? []} />
                <p className="mt-1">Emotional improvement rate: <strong>{servicesProvided.emotionalImprovementRate}%</strong> ({servicesProvided.emotionalImproved} of {servicesProvided.totalSessions} sessions showed positive emotional shift)</p>
                <h6 className="mt-3">Teaching (Education Records)</h6>
                <div className="row">
                  <div className="col-md-6">
                    <p className="text-muted mb-1">By Program</p>
                    <FilterSortTable columns={['program', 'count']} rows={servicesProvided.teachingByProgram ?? []} />
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted mb-1">By Completion Status</p>
                    <FilterSortTable columns={['status', 'count']} rows={servicesProvided.teachingByCompletion ?? []} />
                  </div>
                </div>
                <h6 className="mt-3">Legal Services</h6>
                <p>Referrals made: <strong>{servicesProvided.referralsMade}</strong> | Legal intervention plans: <strong>{servicesProvided.legalPlans}</strong></p>
              </>
            ) : <p className="text-muted">Loading...</p>}
          </DataCard>

          {/* SECTION 3: SAFEHOUSE PERFORMANCE */}
          <DataCard title="Safehouse Performance Comparison">
            {safehouseComparison ? (
              <>
                <h6>Latest Monthly Metrics by Safehouse</h6>
                <FilterSortTable columns={['safehouseId', 'monthStart', 'activeResidents', 'avgEducationProgress', 'avgHealthScore', 'processRecordingCount', 'homeVisitationCount', 'incidentCount']} rows={safehouseComparison.latestMetrics ?? []} />
                <h6 className="mt-3">Incident Breakdown by Safehouse</h6>
                <FilterSortTable columns={['safehouseId', 'incidentType', 'severity', 'count']} rows={safehouseComparison.incidentBreakdown ?? []} />
                <h6 className="mt-3">Occupancy Rates</h6>
                <FilterSortTable columns={['name', 'currentOccupancy', 'capacityGirls', 'occupancyRate']} rows={safehouseComparison.occupancy ?? []} />
              </>
            ) : <p className="text-muted">Loading...</p>}
          </DataCard>

          {/* SECTION 4: DONATION TRENDS */}
          <DataCard title="Donation Trends">
            {donationTrends ? (
              <>
                <h6>Monthly Totals</h6>
                <FilterSortTable columns={['year', 'month', 'total', 'count']} rows={donationTrends.monthlyTotals ?? []} />
                <h6 className="mt-3">By Donation Type</h6>
                <FilterSortTable columns={['donationType', 'total', 'count']} rows={donationTrends.byType ?? []} />
                <h6 className="mt-3">By Campaign</h6>
                {(donationTrends.byCampaign ?? []).length === 0 ? <p className="text-muted">No campaign data.</p> : (
                  <FilterSortTable columns={['campaign', 'total', 'count']} rows={donationTrends.byCampaign} />
                )}
                <h6 className="mt-3">Allocations by Safehouse and Program Area</h6>
                {(donationTrends.allocationsBySafehouse ?? []).length === 0 ? <p className="text-muted">No allocation data.</p> : (
                  <FilterSortTable columns={['safehouseId', 'programArea', 'total']} rows={donationTrends.allocationsBySafehouse} />
                )}
                <h6 className="mt-3">Recurring vs. One-Time</h6>
                <p>Recurring: <strong>{donationTrends.recurringCount}</strong> | One-time: <strong>{donationTrends.oneTimeCount}</strong></p>
                <h6 className="mt-3">New Donors by Month</h6>
                <FilterSortTable columns={['year', 'month', 'count']} rows={donationTrends.newDonorsByMonth ?? []} />
                <h6 className="mt-3">Donors by Acquisition Channel</h6>
                <FilterSortTable columns={['channel', 'count']} rows={donationTrends.byChannel ?? []} />
              </>
            ) : <p className="text-muted">Loading...</p>}
          </DataCard>

          <a className="btn btn-sm btn-outline-primary mt-2" href="/api/reports/export/donations.csv">Export Donations CSV</a>
        </>
      ) : null}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MANAGER DASHBOARD
   ════════════════════════════════════════════════════════════════ */
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

  // Partner detail
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | ''>('');
  const [partnerAssignments, setPartnerAssignments] = useState<any[]>([]);

  // Account creation for workers
  const [acctEmail, setAcctEmail] = useState('');
  const [acctPassword, setAcctPassword] = useState('');
  const [acctName, setAcctName] = useState('');
  const [acctMsg, setAcctMsg] = useState('');

  // Events
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState<any>({ residentId: 0, eventDate: '', eventTime: '09:00', eventTypeChoice: 'Meeting', customEventType: '', eventName: '', notes: '' });
  const [eventMsg, setEventMsg] = useState('');

  async function loadManagerData() {
    apiFetch('/api/dashboard/manager').then(setOverview).catch(() => setOverview(null));
    apiFetch<any>(`/api/residents?includeClosed=${includeClosed}`).then((r) => setResidents(r.data ?? [])).catch(() => setResidents([]));
    apiFetch<any>('/api/donors/donations').then((r) => setDonations(r.data ?? [])).catch(() => setDonations([]));
    apiFetch<any>('/api/partners').then((r) => setPartners(r.data ?? [])).catch(() => setPartners([]));
    apiFetch<any>('/api/workplanner/appointments?page=1&pageSize=500').then((r) => setAppointments(r.data ?? [])).catch(() => setAppointments([]));
    apiFetch<any[]>('/api/reports/case-conferences').then(setConferences).catch(() => setConferences([]));
  }

  useEffect(() => { loadManagerData(); }, [includeClosed]);

  useEffect(() => {
    if (!selectedResidentId) { setSelectedResidentDetail(null); return; }
    apiFetch<any>(`/api/residents/${selectedResidentId}`).then((data) => {
      setSelectedResidentDetail(data);
      setReintegrationType(data.resident?.reintegrationType ?? 'None');
      setReintegrationStatus(data.resident?.reintegrationStatus ?? 'Not Started');
    }).catch(() => setSelectedResidentDetail(null));
  }, [selectedResidentId]);

  useEffect(() => {
    if (!selectedPartnerId) { setPartnerAssignments([]); return; }
    apiFetch<any[]>(`/api/partners/${selectedPartnerId}/assignments`).then(setPartnerAssignments).catch(() => setPartnerAssignments([]));
  }, [selectedPartnerId]);

  async function saveReintegration() {
    if (!selectedResidentId) return;
    await apiFetch(`/api/residents/${selectedResidentId}/reintegration`, { method: 'PUT', body: JSON.stringify({ reintegrationType, reintegrationStatus }) });
    setActionMessage('Reintegration fields updated.');
    await loadManagerData();
  }

  async function closeCase() {
    if (!selectedResidentId) return;
    if (!window.confirm('Are you sure you want to close this case? This will remove the resident from active caseload views.')) return;
    await apiFetch(`/api/residents/${selectedResidentId}/close`, { method: 'POST' });
    setActionMessage('Case closed.');
    await loadManagerData();
    setSelectedResidentId('');
  }

  async function reopenCase() {
    if (!selectedResidentId) return;
    if (!window.confirm('Are you sure you want to reopen this case?')) return;
    await apiFetch(`/api/residents/${selectedResidentId}/reopen`, { method: 'POST' });
    setActionMessage('Case reopened.');
    await loadManagerData();
    setSelectedResidentId('');
  }

  async function createWorkerAccount() {
    setAcctMsg('');
    try {
      await apiFetch('/api/auth/create-account', { method: 'POST', body: JSON.stringify({ email: acctEmail, password: acctPassword, displayName: acctName, role: 'SocialWorker' }) });
      setAcctMsg('Social Worker account created.');
      setAcctEmail(''); setAcctPassword(''); setAcctName('');
    } catch (e) { setAcctMsg((e as Error).message); }
  }

  async function saveManagerEvent() {
    setEventMsg('');
    if (!eventForm.eventDate) { setEventMsg('Date is required.'); return; }
    const eventType = eventForm.eventTypeChoice === 'Custom' ? eventForm.customEventType : eventForm.eventTypeChoice;
    const eventName = eventForm.eventName || eventType;
    try {
      await apiFetch('/api/workplanner/appointments', { method: 'POST', body: JSON.stringify({ residentId: eventForm.residentId || 0, eventName, appointmentDate: eventForm.eventDate, appointmentTime: eventForm.eventTime, appointmentType: eventType, sessionFormat: 'Individual', notes: eventForm.notes, status: 'Scheduled' }) });
      setEventMsg('Event created.');
      setShowEventModal(false);
      await loadManagerData();
    } catch (e) { setEventMsg((e as Error).message); }
  }

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'schedule', 'caseload', 'donors', 'appointments', 'partners', 'conferences']} onSelect={setTab} />

      {tab === 'overview' ? (
        <>
          <MetricsCard title="Regional Snapshot" data={overview} />
          <DataCard title="Create Social Worker Account">
            <div className="row g-2">
              <div className="col-md-3"><input className="form-control" placeholder="Name" value={acctName} onChange={(e) => setAcctName(e.target.value)} /></div>
              <div className="col-md-3"><input className="form-control" placeholder="Email" value={acctEmail} onChange={(e) => setAcctEmail(e.target.value)} /></div>
              <div className="col-md-3"><input className="form-control" type="password" placeholder="Password (12+ chars)" value={acctPassword} onChange={(e) => setAcctPassword(e.target.value)} /></div>
              <div className="col-md-3"><button className="btn btn-primary w-100" onClick={createWorkerAccount}>Create Worker</button></div>
            </div>
            {acctMsg ? <p className="mt-2 mb-0">{acctMsg}</p> : null}
          </DataCard>
        </>
      ) : null}

      {tab === 'schedule' ? (
        <DataCard title="Manager Schedule">
          <ScheduleCalendar title="Regional Manager Schedule" appointments={appointments} residents={residents}
            onAddEvent={() => { setShowEventModal(true); setEventForm({ residentId: 0, eventDate: '', eventTime: '09:00', eventTypeChoice: 'Meeting', customEventType: '', eventName: '', notes: '' }); }} />
          {showEventModal ? (
            <div className="event-modal-backdrop"><div className="event-modal-card">
              <h5 className="mb-2">Add Event</h5>
              <div className="row g-2">
                <div className="col-md-4"><label className="form-label">Date</label><input className="form-control" type="date" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Time</label><input className="form-control" type="time" value={eventForm.eventTime} onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Type</label><select className="form-select" value={eventForm.eventTypeChoice} onChange={(e) => setEventForm({ ...eventForm, eventTypeChoice: e.target.value })}><option>Meeting</option><option>Staff Check-in</option><option>Case Review</option><option>Custom</option></select></div>
              </div>
              {eventForm.eventTypeChoice === 'Custom' ? <div className="mt-2"><input className="form-control" placeholder="Custom type" value={eventForm.customEventType} onChange={(e) => setEventForm({ ...eventForm, customEventType: e.target.value })} /></div> : null}
              <div className="mt-2"><input className="form-control" placeholder="Event name" value={eventForm.eventName} onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })} /></div>
              <div className="mt-2"><textarea className="form-control" rows={2} placeholder="Notes" value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })} /></div>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-secondary" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveManagerEvent}>Save</button>
              </div>
              {eventMsg ? <p className="mt-2 mb-0">{eventMsg}</p> : null}
            </div></div>
          ) : null}
        </DataCard>
      ) : null}

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
            {residents.map((r) => <option key={r.residentId} value={r.residentId}>{r.internalCode} ({r.caseStatus})</option>)}
          </select>
          {selectedResidentDetail ? (
            <div className="border rounded p-3">
              <p className="mb-2"><strong>Internal Code:</strong> {selectedResidentDetail.resident.internalCode}</p>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">Reintegration Type</label>
                  <select className="form-select" value={reintegrationType} onChange={(e) => setReintegrationType(e.target.value)}>
                    <option>None</option><option>Family Reunification</option><option>Foster Care</option><option>Adoption (Domestic)</option><option>Adoption (Inter-Country)</option><option>Independent Living</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Reintegration Status</label>
                  <select className="form-select" value={reintegrationStatus} onChange={(e) => setReintegrationStatus(e.target.value)}>
                    <option>Not Started</option><option>In Progress</option><option>Completed</option><option>On Hold</option>
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-primary btn-sm" onClick={saveReintegration}>Save Reintegration</button>
                {selectedResidentDetail.resident.caseStatus === 'Closed'
                  ? <button className="btn btn-outline-success btn-sm" onClick={reopenCase}>Reopen Case</button>
                  : <button className="btn btn-outline-danger btn-sm" onClick={closeCase}>Close Case</button>}
              </div>
              <div className="mt-2 text-muted small">
                Timeline: process {selectedResidentDetail.timeline?.processRecordings?.length ?? 0}, home visits {selectedResidentDetail.timeline?.homeVisitations?.length ?? 0}, education {selectedResidentDetail.timeline?.educationRecords?.length ?? 0}, health {selectedResidentDetail.timeline?.healthRecords?.length ?? 0}
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
          <FilterSortTable columns={['residentInternalCode', 'socialWorker', 'appointmentDate', 'appointmentType', 'sessionFormat', 'status']} rows={appointments} />
        </DataCard>
      ) : null}

      {tab === 'partners' ? (
        <DataCard title="Partners (View Only)">
          <FilterSortTable columns={['partnerName', 'roleType', 'region', 'status', 'startDate', 'endDate']} rows={partners}
            onRowClick={(row) => setSelectedPartnerId(row.partnerId)} />
          {selectedPartnerId ? (
            <div className="border rounded p-3 mt-2">
              <div className="d-flex justify-content-between"><h6>Partner Assignments</h6><button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedPartnerId('')}>Close</button></div>
              {partnerAssignments.length === 0 ? <p className="text-muted">No assignments.</p> : (
                <FilterSortTable columns={['safehouseId', 'programArea', 'assignmentStart', 'assignmentEnd', 'isPrimary', 'status']} rows={partnerAssignments} />
              )}
            </div>
          ) : null}
        </DataCard>
      ) : null}

      {tab === 'conferences' ? (
        <DataCard title="Case Conferences">
          <FilterSortTable columns={['internalCode', 'conferenceDate', 'planCategories', 'planCount']} rows={conferences} />
        </DataCard>
      ) : null}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STAFF DASHBOARD
   ════════════════════════════════════════════════════════════════ */
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
  const [formDetailView, setFormDetailView] = useState<any>(null);

  // Intake form with all fields
  const [intake, setIntake] = useState<any>({
    safehouseId: 1, caseControlNo: '', internalCode: '', dateOfBirth: '', birthStatus: 'Marital', placeOfBirth: '', religion: '',
    caseCategory: 'Neglected', subCategories: '',
    personWithDisability: false, pwdType: '', hasSpecialNeeds: false, specialNeedsDiagnosis: '',
    is4PsBeneficiary: false, soloParentHousehold: false, indigenousFamily: false, parentIsPwd: false, informalSettler: false,
    dateEnrolled: '', referralSource: 'Government Agency', referringAgency: '',
    assignedSocialWorker: user?.displayName ?? '', initialRiskLevel: 'Medium', currentRiskLevel: 'Medium',
    dateColbRegistered: '', dateColbObtained: '', initialCaseAssessment: '', dateCaseStudyPrepared: '',
    reintegrationType: 'None', reintegrationStatus: 'Not Started', initialNotes: ''
  });

  const [processForm, setProcessForm] = useState<any>({ residentId: 0, sessionDate: '', socialWorker: user?.displayName ?? '', sessionType: 'Individual', sessionDurationMinutes: 60, emotionalStateObserved: 'Anxious', emotionalStateEnd: 'Calm', sessionNarrative: '', interventionsApplied: '', followUpActions: '', progressNoted: false, concernsFlagged: false, referralMade: false });
  const [homeForm, setHomeForm] = useState<any>({ residentId: 0, visitDate: '', socialWorker: user?.displayName ?? '', visitType: 'Routine Follow-Up', locationVisited: '', familyMembersPresent: '', purpose: '', observations: '', familyCooperationLevel: 'Cooperative', safetyConcernsNoted: false, followUpNeeded: false, followUpNotes: '', visitOutcome: 'Favorable' });
  const [educationForm, setEducationForm] = useState<any>({ residentId: 0, recordDate: '', programName: 'Bridge Program', courseName: 'Math', educationLevel: 'Secondary', schoolName: '', enrollmentStatus: 'InProgress', attendanceRate: 0.9, progressPercent: 50, completionStatus: 'InProgress', gpaLikeScore: 3.0, notes: '' });
  const [healthForm, setHealthForm] = useState<any>({ residentId: 0, recordDate: '', generalHealthScore: 3.5, nutritionScore: 3.5, sleepQualityScore: 3.5, energyLevelScore: 3.5, heightCm: 150, weightKg: 45, medicalCheckupDone: false, dentalCheckupDone: false, psychologicalCheckupDone: false, notes: '' });
  const [planForm, setPlanForm] = useState<any>({ residentId: 0, planCategory: 'Psychosocial', planDescription: '', servicesProvided: 'Healing', targetValue: '', targetDate: '', status: 'Open', caseConferenceDate: '' });
  const [incidentForm, setIncidentForm] = useState<any>({ residentId: 0, safehouseId: 1, incidentDate: '', incidentType: 'Behavioral', severity: 'Low', description: '', responseTaken: '', resolved: false, resolutionDate: '', reportedBy: user?.displayName ?? '', followUpRequired: false });

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState<any>({ residentId: 0, eventDate: '', eventTime: '09:00', eventTypeChoice: 'Intake Form', customEventType: '', eventName: '', notes: '' });

  const computedBmi = healthForm.heightCm > 0 ? (healthForm.weightKg / ((healthForm.heightCm / 100) ** 2)).toFixed(1) : '0';

  async function loadStaffData() {
    apiFetch('/api/dashboard/staff').then(setOverview).catch(() => setOverview(null));
    apiFetch<any[]>('/api/ml/recommended-sessions').then(setRiskRows).catch(() => setRiskRows([]));
    apiFetch<any>('/api/residents').then((r) => setResidents(r.data ?? [])).catch(() => setResidents([]));
    apiFetch<any>('/api/workplanner/appointments?page=1&pageSize=500').then((r) => setAppointments(r.data ?? [])).catch(() => setAppointments([]));
    const todoData = await apiFetch<any[]>('/api/workplanner/todos');
    setTodos(todoData);
  }

  useEffect(() => { loadStaffData().catch(() => null); }, []);

  useEffect(() => {
    if (!selectedResidentForForms) { setFormsTimeline(null); return; }
    apiFetch<any>(`/api/residents/${selectedResidentForForms}`).then(setFormsTimeline).catch(() => setFormsTimeline(null));
  }, [selectedResidentForForms]);

  async function addTodo() { if (!taskText.trim()) return; await apiFetch('/api/workplanner/todos', { method: 'POST', body: JSON.stringify({ taskText }) }); setTaskText(''); await loadStaffData(); }
  async function toggleTodo(todoId: number) { await apiFetch(`/api/workplanner/todos/${todoId}/toggle`, { method: 'POST' }); await loadStaffData(); }
  async function deleteTodo(todoId: number) { if (!window.confirm('Remove this task?')) return; await apiFetch(`/api/workplanner/todos/${todoId}`, { method: 'DELETE' }); await loadStaffData(); }
  async function clearCompleted() { if (!window.confirm('Clear completed tasks?')) return; await apiFetch('/api/workplanner/todos/clear-completed', { method: 'DELETE' }); await loadStaffData(); }

  async function saveEvent() {
    setFormResult('');
    if (!eventForm.residentId || !eventForm.eventDate || !eventForm.eventTime) { setFormResult('Resident, date, and time are required.'); return; }
    if (eventForm.eventTypeChoice === 'Custom' && !String(eventForm.customEventType).trim()) { setFormResult('Enter event type.'); return; }
    const eventType = eventForm.eventTypeChoice === 'Custom' ? String(eventForm.customEventType).trim() : eventForm.eventTypeChoice;
    const eventName = String(eventForm.eventName || eventType).trim();
    try {
      if (editingAppointmentId) {
        await apiFetch(`/api/workplanner/appointments/${editingAppointmentId}`, { method: 'PUT', body: JSON.stringify({ residentId: eventForm.residentId, eventName, appointmentDate: eventForm.eventDate, appointmentTime: eventForm.eventTime, appointmentType: eventType, sessionFormat: 'Individual', notes: eventForm.notes, status: 'Scheduled' }) });
        setFormResult('Event updated.');
      } else {
        await apiFetch('/api/workplanner/appointments', { method: 'POST', body: JSON.stringify({ residentId: eventForm.residentId, eventName, appointmentDate: eventForm.eventDate, appointmentTime: eventForm.eventTime, appointmentType: eventType, notes: eventForm.notes, sessionFormat: 'Individual', location: '', status: 'Scheduled', staffUserId: user?.id ?? '' }) });
        setFormResult('Event created.');
      }
      setShowEventModal(false); setEditingAppointmentId(null);
      setEventForm({ residentId: 0, eventDate: '', eventTime: '09:00', eventTypeChoice: 'Intake Form', customEventType: '', eventName: '', notes: '' });
      await loadStaffData();
    } catch (e) { setFormResult((e as Error).message); }
  }

  async function deleteEvent(appointmentId: number) { if (!window.confirm('Delete this event?')) return; await apiFetch(`/api/workplanner/appointments/${appointmentId}`, { method: 'DELETE' }); await loadStaffData(); }
  async function toggleEventComplete(appointmentId: number, completed: boolean) { await apiFetch(`/api/workplanner/appointments/${appointmentId}/complete`, { method: 'POST', body: JSON.stringify({ completed }) }); await loadStaffData(); }
  function editEvent(appointment: any) {
    const knownTypes = ['Intake Form', 'Process Recording', 'Home Visitation Report', 'Education Record', 'Health & Wellbeing Record', 'Intervention Plan', 'Incident Report'];
    const isCustom = !knownTypes.includes(String(appointment.appointmentType ?? ''));
    setEditingAppointmentId(appointment.appointmentId);
    setEventForm({ residentId: appointment.residentId ?? 0, eventDate: String(appointment.appointmentDate ?? ''), eventTime: formatTimeValue(appointment.appointmentTime), eventTypeChoice: isCustom ? 'Custom' : String(appointment.appointmentType ?? 'Intake Form'), customEventType: isCustom ? String(appointment.appointmentType ?? '') : '', eventName: String(appointment.eventName ?? ''), notes: String(appointment.notes ?? '') });
    setShowEventModal(true);
  }

  async function submitSelectedForm() {
    setFormResult('');
    try {
      if (formType === 'intake') await apiFetch('/api/forms/intake', { method: 'POST', body: JSON.stringify(intake) });
      if (formType === 'process-recording') await apiFetch('/api/forms/process-recording', { method: 'POST', body: JSON.stringify(processForm) });
      if (formType === 'home-visitation') await apiFetch('/api/forms/home-visitation', { method: 'POST', body: JSON.stringify(homeForm) });
      if (formType === 'education-record') await apiFetch('/api/forms/education-record', { method: 'POST', body: JSON.stringify(educationForm) });
      if (formType === 'health-record') await apiFetch('/api/forms/health-record', { method: 'POST', body: JSON.stringify({ ...healthForm, bmi: parseFloat(computedBmi) }) });
      if (formType === 'intervention-plan') await apiFetch('/api/forms/intervention-plan', { method: 'POST', body: JSON.stringify(planForm) });
      if (formType === 'incident-report') await apiFetch('/api/forms/incident-report', { method: 'POST', body: JSON.stringify(incidentForm) });
      setFormResult('Form submitted. Submitted forms are read-only; submit a new row for corrections.');
      await loadStaffData();
      if (selectedResidentForForms) {
        const timeline = await apiFetch<any>(`/api/residents/${selectedResidentForForms}`);
        setFormsTimeline(timeline);
      }
    } catch (e) { setFormResult((e as Error).message); }
  }

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'schedule', 'caseload', 'forms', 'todos']} onSelect={setTab} />

      {tab === 'overview' ? (
        <>
          <MetricsCard title="Assigned Caseload Snapshot" data={overview} />
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
                    <button className="btn btn-sm btn-outline-success" onClick={() => toggleTodo(todo.todoId)}>{todo.isCompleted ? 'Undo' : 'Done'}</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTodo(todo.todoId)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </DataCard>
          <DataCard title="Recommended Sessions (ML)">
            <FilterSortTable columns={['residentId', 'sessionType', 'weeklySessions', 'reason']} rows={riskRows} />
          </DataCard>
        </>
      ) : null}

      {tab === 'schedule' ? (
        <DataCard title="Schedule">
          <ScheduleCalendar title="My Schedule" appointments={appointments} residents={residents}
            onFillOutForm={(residentId) => { setTab('forms'); if (residentId) setSelectedResidentForForms(residentId); }}
            onAddEvent={() => { setEditingAppointmentId(null); setEventForm({ residentId: 0, eventDate: '', eventTime: '09:00', eventTypeChoice: 'Intake Form', customEventType: '', eventName: '', notes: '' }); setShowEventModal(true); }}
            onEditEvent={(appt) => editEvent(appt)}
            onDeleteEvent={(appt) => deleteEvent(appt.appointmentId)}
            onToggleComplete={(appt, completed) => toggleEventComplete(appt.appointmentId, completed)} />
          {showEventModal ? (
            <div className="event-modal-backdrop"><div className="event-modal-card">
              <h5 className="mb-2">{editingAppointmentId ? 'Edit Event' : 'Add Event'}</h5>
              <div className="row g-2">
                <div className="col-md-6"><label className="form-label">Resident</label><select className="form-select" value={eventForm.residentId} onChange={(e) => setEventForm({ ...eventForm, residentId: Number(e.target.value) })}><option value={0}>Select</option>{residents.map((r) => <option key={r.residentId} value={r.residentId}>{r.internalCode}</option>)}</select></div>
                <div className="col-md-3"><label className="form-label">Date</label><input className="form-control" type="date" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Time</label><input className="form-control" type="time" value={eventForm.eventTime} onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })} /></div>
              </div>
              <div className="mt-2"><label className="form-label">Event Type</label><select className="form-select" value={eventForm.eventTypeChoice} onChange={(e) => setEventForm({ ...eventForm, eventTypeChoice: e.target.value })}><option>Intake Form</option><option>Process Recording</option><option>Home Visitation Report</option><option>Education Record</option><option>Health & Wellbeing Record</option><option>Intervention Plan</option><option>Incident Report</option><option>Custom</option></select></div>
              {eventForm.eventTypeChoice === 'Custom' ? <div className="mt-2"><input className="form-control" placeholder="Custom type" value={eventForm.customEventType} onChange={(e) => setEventForm({ ...eventForm, customEventType: e.target.value })} /></div> : null}
              <div className="mt-2"><input className="form-control" placeholder="Event name" value={eventForm.eventName} onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })} /></div>
              <div className="mt-2"><textarea className="form-control" rows={2} placeholder="Notes" value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })} /></div>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-secondary" onClick={() => { setShowEventModal(false); setEditingAppointmentId(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={saveEvent}>Save Event</button>
              </div>
            </div></div>
          ) : null}
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
              <label className="form-label">Select Resident (form history)</label>
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

          {/* ── INTAKE FORM (full fields) ── */}
          {formType === 'intake' ? (
            <div>
              <h6>Intake Form - Resident Admission Record</h6>
              <div className="row g-2">
                <div className="col-md-3"><label className="form-label">Safehouse</label><input className="form-control" type="number" value={intake.safehouseId} onChange={(e) => setIntake({ ...intake, safehouseId: Number(e.target.value) })} /></div>
                <div className="col-md-3"><label className="form-label">Case Control No</label><input className="form-control" value={intake.caseControlNo} onChange={(e) => setIntake({ ...intake, caseControlNo: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Internal Code</label><input className="form-control" value={intake.internalCode} onChange={(e) => setIntake({ ...intake, internalCode: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Date of Birth</label><input className="form-control" type="date" value={intake.dateOfBirth} onChange={(e) => setIntake({ ...intake, dateOfBirth: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Birth Status</label><select className="form-select" value={intake.birthStatus} onChange={(e) => setIntake({ ...intake, birthStatus: e.target.value })}><option>Marital</option><option>Non-Marital</option></select></div>
                <div className="col-md-3"><label className="form-label">Place of Birth</label><input className="form-control" value={intake.placeOfBirth} onChange={(e) => setIntake({ ...intake, placeOfBirth: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Religion</label><input className="form-control" value={intake.religion} onChange={(e) => setIntake({ ...intake, religion: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Case Category</label><select className="form-select" value={intake.caseCategory} onChange={(e) => setIntake({ ...intake, caseCategory: e.target.value })}><option>Abandoned</option><option>Foundling</option><option>Surrendered</option><option>Neglected</option></select></div>
              </div>
              <div className="mt-2"><label className="form-label">Sub-Categories (check all that apply)</label>
                <div className="d-flex flex-wrap gap-2">
                  {['Orphaned','Trafficked','Child Labor','Physical Abuse','Sexual Abuse','OSAEC/CSAEM','CICL','At Risk (CAR)','Street Child','Child with HIV'].map((cat) => {
                    const selected = (intake.subCategories || '').split(',').map((s: string) => s.trim()).filter(Boolean);
                    const checked = selected.includes(cat);
                    return <div key={cat} className="form-check"><input className="form-check-input" type="checkbox" checked={checked} onChange={() => {
                      const next = checked ? selected.filter((s: string) => s !== cat) : [...selected, cat];
                      setIntake({ ...intake, subCategories: next.join(', ') });
                    }} /><label className="form-check-label">{cat}</label></div>;
                  })}
                </div>
              </div>
              <div className="row g-2 mt-2">
                <div className="col-md-3"><div className="form-check"><input className="form-check-input" type="checkbox" checked={intake.personWithDisability} onChange={(e) => setIntake({ ...intake, personWithDisability: e.target.checked })} /><label className="form-check-label">Person with Disability</label></div></div>
                {intake.personWithDisability ? <div className="col-md-3"><input className="form-control" placeholder="PWD Type" value={intake.pwdType} onChange={(e) => setIntake({ ...intake, pwdType: e.target.value })} /></div> : null}
                <div className="col-md-3"><div className="form-check"><input className="form-check-input" type="checkbox" checked={intake.hasSpecialNeeds} onChange={(e) => setIntake({ ...intake, hasSpecialNeeds: e.target.checked })} /><label className="form-check-label">Has Special Needs</label></div></div>
                {intake.hasSpecialNeeds ? <div className="col-md-3"><input className="form-control" placeholder="Diagnosis" value={intake.specialNeedsDiagnosis} onChange={(e) => setIntake({ ...intake, specialNeedsDiagnosis: e.target.value })} /></div> : null}
              </div>
              <div className="row g-2 mt-2">
                <div className="col-md-2"><div className="form-check"><input className="form-check-input" type="checkbox" checked={intake.is4PsBeneficiary} onChange={(e) => setIntake({ ...intake, is4PsBeneficiary: e.target.checked })} /><label className="form-check-label">4Ps Beneficiary</label></div></div>
                <div className="col-md-2"><div className="form-check"><input className="form-check-input" type="checkbox" checked={intake.soloParentHousehold} onChange={(e) => setIntake({ ...intake, soloParentHousehold: e.target.checked })} /><label className="form-check-label">Solo Parent</label></div></div>
                <div className="col-md-2"><div className="form-check"><input className="form-check-input" type="checkbox" checked={intake.indigenousFamily} onChange={(e) => setIntake({ ...intake, indigenousFamily: e.target.checked })} /><label className="form-check-label">Indigenous</label></div></div>
                <div className="col-md-2"><div className="form-check"><input className="form-check-input" type="checkbox" checked={intake.parentIsPwd} onChange={(e) => setIntake({ ...intake, parentIsPwd: e.target.checked })} /><label className="form-check-label">Parent is PWD</label></div></div>
                <div className="col-md-2"><div className="form-check"><input className="form-check-input" type="checkbox" checked={intake.informalSettler} onChange={(e) => setIntake({ ...intake, informalSettler: e.target.checked })} /><label className="form-check-label">Informal Settler</label></div></div>
              </div>
              <div className="row g-2 mt-2">
                <div className="col-md-3"><label className="form-label">Date of Admission</label><input className="form-control" type="date" value={intake.dateEnrolled} onChange={(e) => setIntake({ ...intake, dateEnrolled: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Referral Source</label><select className="form-select" value={intake.referralSource} onChange={(e) => setIntake({ ...intake, referralSource: e.target.value })}><option>Government Agency</option><option>NGO</option><option>Police</option><option>Self-Referral</option><option>Community</option><option>Court Order</option></select></div>
                <div className="col-md-3"><label className="form-label">Referring Agency</label><input className="form-control" value={intake.referringAgency} onChange={(e) => setIntake({ ...intake, referringAgency: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Assigned Staff</label><input className="form-control" value={intake.assignedSocialWorker} onChange={(e) => setIntake({ ...intake, assignedSocialWorker: e.target.value })} /></div>
                <div className="col-md-3"><label className="form-label">Initial Risk</label><select className="form-select" value={intake.initialRiskLevel} onChange={(e) => setIntake({ ...intake, initialRiskLevel: e.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
                <div className="col-md-3"><label className="form-label">Current Risk</label><select className="form-select" value={intake.currentRiskLevel} onChange={(e) => setIntake({ ...intake, currentRiskLevel: e.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
                <div className="col-md-3"><label className="form-label">Reintegration Type</label><select className="form-select" value={intake.reintegrationType} onChange={(e) => setIntake({ ...intake, reintegrationType: e.target.value })}><option>None</option><option>Family Reunification</option><option>Foster Care</option><option>Adoption (Domestic)</option><option>Adoption (Inter-Country)</option><option>Independent Living</option></select></div>
                <div className="col-md-3"><label className="form-label">Assessment</label><input className="form-control" value={intake.initialCaseAssessment} onChange={(e) => setIntake({ ...intake, initialCaseAssessment: e.target.value })} /></div>
              </div>
              <div className="mt-2"><label className="form-label">Initial Notes</label><textarea className="form-control" rows={2} value={intake.initialNotes} onChange={(e) => setIntake({ ...intake, initialNotes: e.target.value })} /></div>
            </div>
          ) : null}

          {formType === 'process-recording' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><select className="form-select" value={processForm.residentId} onChange={(e) => setProcessForm({ ...processForm, residentId: Number(e.target.value) })}><option value={0}>Select</option>{residents.map((r) => <option key={r.residentId} value={r.residentId}>{r.internalCode}</option>)}</select></div>
              <div className="col-md-3"><label className="form-label">Session Date</label><input className="form-control" type="date" value={processForm.sessionDate} onChange={(e) => setProcessForm({ ...processForm, sessionDate: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Session Type</label><select className="form-select" value={processForm.sessionType} onChange={(e) => setProcessForm({ ...processForm, sessionType: e.target.value })}><option>Individual</option><option>Group</option></select></div>
              <div className="col-md-3"><label className="form-label">Duration (min)</label><input className="form-control" type="number" value={processForm.sessionDurationMinutes} onChange={(e) => setProcessForm({ ...processForm, sessionDurationMinutes: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Emotional Start</label><select className="form-select" value={processForm.emotionalStateObserved} onChange={(e) => setProcessForm({ ...processForm, emotionalStateObserved: e.target.value })}><option>Calm</option><option>Anxious</option><option>Sad</option><option>Angry</option><option>Hopeful</option><option>Withdrawn</option><option>Happy</option><option>Distressed</option></select></div>
              <div className="col-md-3"><label className="form-label">Emotional End</label><select className="form-select" value={processForm.emotionalStateEnd} onChange={(e) => setProcessForm({ ...processForm, emotionalStateEnd: e.target.value })}><option>Calm</option><option>Anxious</option><option>Sad</option><option>Angry</option><option>Hopeful</option><option>Withdrawn</option><option>Happy</option><option>Distressed</option></select></div>
              <div className="col-md-6"><label className="form-label">Narrative</label><textarea className="form-control" rows={2} value={processForm.sessionNarrative} onChange={(e) => setProcessForm({ ...processForm, sessionNarrative: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label">Interventions</label><textarea className="form-control" rows={2} value={processForm.interventionsApplied} onChange={(e) => setProcessForm({ ...processForm, interventionsApplied: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label">Follow-Up Actions</label><textarea className="form-control" rows={2} value={processForm.followUpActions} onChange={(e) => setProcessForm({ ...processForm, followUpActions: e.target.value })} /></div>
              <div className="col-md-2"><div className="form-check mt-4"><input className="form-check-input" type="checkbox" checked={processForm.progressNoted} onChange={(e) => setProcessForm({ ...processForm, progressNoted: e.target.checked })} /><label className="form-check-label">Progress</label></div></div>
              <div className="col-md-2"><div className="form-check mt-4"><input className="form-check-input" type="checkbox" checked={processForm.concernsFlagged} onChange={(e) => setProcessForm({ ...processForm, concernsFlagged: e.target.checked })} /><label className="form-check-label">Concerns</label></div></div>
              <div className="col-md-2"><div className="form-check mt-4"><input className="form-check-input" type="checkbox" checked={processForm.referralMade} onChange={(e) => setProcessForm({ ...processForm, referralMade: e.target.checked })} /><label className="form-check-label">Referral</label></div></div>
            </div>
          ) : null}

          {formType === 'home-visitation' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><select className="form-select" value={homeForm.residentId} onChange={(e) => setHomeForm({ ...homeForm, residentId: Number(e.target.value) })}><option value={0}>Select</option>{residents.map((r) => <option key={r.residentId} value={r.residentId}>{r.internalCode}</option>)}</select></div>
              <div className="col-md-3"><label className="form-label">Visit Date</label><input className="form-control" type="date" value={homeForm.visitDate} onChange={(e) => setHomeForm({ ...homeForm, visitDate: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Visit Type</label><select className="form-select" value={homeForm.visitType} onChange={(e) => setHomeForm({ ...homeForm, visitType: e.target.value })}><option>Initial Assessment</option><option>Routine Follow-Up</option><option>Reintegration Assessment</option><option>Post-Placement Monitoring</option><option>Emergency</option></select></div>
              <div className="col-md-3"><label className="form-label">Outcome</label><select className="form-select" value={homeForm.visitOutcome} onChange={(e) => setHomeForm({ ...homeForm, visitOutcome: e.target.value })}><option>Favorable</option><option>Needs Improvement</option><option>Unfavorable</option><option>Inconclusive</option></select></div>
              <div className="col-md-4"><label className="form-label">Location</label><input className="form-control" value={homeForm.locationVisited} onChange={(e) => setHomeForm({ ...homeForm, locationVisited: e.target.value })} /></div>
              <div className="col-md-4"><label className="form-label">Family Present</label><input className="form-control" value={homeForm.familyMembersPresent} onChange={(e) => setHomeForm({ ...homeForm, familyMembersPresent: e.target.value })} /></div>
              <div className="col-md-4"><label className="form-label">Cooperation</label><select className="form-select" value={homeForm.familyCooperationLevel} onChange={(e) => setHomeForm({ ...homeForm, familyCooperationLevel: e.target.value })}><option>Highly Cooperative</option><option>Cooperative</option><option>Neutral</option><option>Uncooperative</option></select></div>
              <div className="col-md-6"><label className="form-label">Purpose</label><textarea className="form-control" rows={2} value={homeForm.purpose} onChange={(e) => setHomeForm({ ...homeForm, purpose: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label">Observations</label><textarea className="form-control" rows={2} value={homeForm.observations} onChange={(e) => setHomeForm({ ...homeForm, observations: e.target.value })} /></div>
              <div className="col-md-2"><div className="form-check mt-3"><input className="form-check-input" type="checkbox" checked={homeForm.safetyConcernsNoted} onChange={(e) => setHomeForm({ ...homeForm, safetyConcernsNoted: e.target.checked })} /><label className="form-check-label">Safety Concerns</label></div></div>
              <div className="col-md-2"><div className="form-check mt-3"><input className="form-check-input" type="checkbox" checked={homeForm.followUpNeeded} onChange={(e) => setHomeForm({ ...homeForm, followUpNeeded: e.target.checked })} /><label className="form-check-label">Follow-Up</label></div></div>
              {homeForm.followUpNeeded ? <div className="col-md-8"><label className="form-label">Follow-Up Notes</label><textarea className="form-control" rows={2} value={homeForm.followUpNotes} onChange={(e) => setHomeForm({ ...homeForm, followUpNotes: e.target.value })} /></div> : null}
            </div>
          ) : null}

          {formType === 'education-record' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><select className="form-select" value={educationForm.residentId} onChange={(e) => setEducationForm({ ...educationForm, residentId: Number(e.target.value) })}><option value={0}>Select</option>{residents.map((r) => <option key={r.residentId} value={r.residentId}>{r.internalCode}</option>)}</select></div>
              <div className="col-md-3"><label className="form-label">Date</label><input className="form-control" type="date" value={educationForm.recordDate} onChange={(e) => setEducationForm({ ...educationForm, recordDate: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Program</label><select className="form-select" value={educationForm.programName} onChange={(e) => setEducationForm({ ...educationForm, programName: e.target.value })}><option>Bridge Program</option><option>Secondary Support</option><option>Vocational Skills</option><option>Literacy Boost</option></select></div>
              <div className="col-md-3"><label className="form-label">Course</label><select className="form-select" value={educationForm.courseName} onChange={(e) => setEducationForm({ ...educationForm, courseName: e.target.value })}><option>Math</option><option>English</option><option>Science</option><option>Life Skills</option><option>Computer Basics</option><option>Livelihood</option></select></div>
              <div className="col-md-3"><label className="form-label">Level</label><select className="form-select" value={educationForm.educationLevel} onChange={(e) => setEducationForm({ ...educationForm, educationLevel: e.target.value })}><option>Primary</option><option>Secondary</option><option>Vocational</option><option>CollegePrep</option></select></div>
              <div className="col-md-3"><label className="form-label">Completion</label><select className="form-select" value={educationForm.completionStatus} onChange={(e) => setEducationForm({ ...educationForm, completionStatus: e.target.value })}><option>NotStarted</option><option>InProgress</option><option>Completed</option></select></div>
              <div className="col-md-2"><label className="form-label">Attendance (0-1)</label><input className="form-control" type="number" step="0.01" value={educationForm.attendanceRate} onChange={(e) => setEducationForm({ ...educationForm, attendanceRate: Number(e.target.value) })} /></div>
              <div className="col-md-2"><label className="form-label">Progress %</label><input className="form-control" type="number" value={educationForm.progressPercent} onChange={(e) => setEducationForm({ ...educationForm, progressPercent: Number(e.target.value) })} /></div>
              <div className="col-md-2"><label className="form-label">GPA (1-5)</label><input className="form-control" type="number" step="0.1" value={educationForm.gpaLikeScore} onChange={(e) => setEducationForm({ ...educationForm, gpaLikeScore: Number(e.target.value) })} /></div>
            </div>
          ) : null}

          {formType === 'health-record' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><select className="form-select" value={healthForm.residentId} onChange={(e) => setHealthForm({ ...healthForm, residentId: Number(e.target.value) })}><option value={0}>Select</option>{residents.map((r) => <option key={r.residentId} value={r.residentId}>{r.internalCode}</option>)}</select></div>
              <div className="col-md-3"><label className="form-label">Date</label><input className="form-control" type="date" value={healthForm.recordDate} onChange={(e) => setHealthForm({ ...healthForm, recordDate: e.target.value })} /></div>
              <div className="col-md-2"><label className="form-label">Weight (kg)</label><input className="form-control" type="number" value={healthForm.weightKg} onChange={(e) => setHealthForm({ ...healthForm, weightKg: Number(e.target.value) })} /></div>
              <div className="col-md-2"><label className="form-label">Height (cm)</label><input className="form-control" type="number" value={healthForm.heightCm} onChange={(e) => setHealthForm({ ...healthForm, heightCm: Number(e.target.value) })} /></div>
              <div className="col-md-2"><label className="form-label">BMI</label><input className="form-control" readOnly value={computedBmi} /></div>
              <div className="col-md-3"><label className="form-label">Health</label><input className="form-control" type="number" step="0.1" value={healthForm.generalHealthScore} onChange={(e) => setHealthForm({ ...healthForm, generalHealthScore: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Nutrition</label><input className="form-control" type="number" step="0.1" value={healthForm.nutritionScore} onChange={(e) => setHealthForm({ ...healthForm, nutritionScore: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Sleep</label><input className="form-control" type="number" step="0.1" value={healthForm.sleepQualityScore} onChange={(e) => setHealthForm({ ...healthForm, sleepQualityScore: Number(e.target.value) })} /></div>
              <div className="col-md-3"><label className="form-label">Energy</label><input className="form-control" type="number" step="0.1" value={healthForm.energyLevelScore} onChange={(e) => setHealthForm({ ...healthForm, energyLevelScore: Number(e.target.value) })} /></div>
              <div className="col-md-3"><div className="form-check mt-3"><input className="form-check-input" type="checkbox" checked={healthForm.medicalCheckupDone} onChange={(e) => setHealthForm({ ...healthForm, medicalCheckupDone: e.target.checked })} /><label className="form-check-label">Medical Checkup</label></div></div>
              <div className="col-md-3"><div className="form-check mt-3"><input className="form-check-input" type="checkbox" checked={healthForm.dentalCheckupDone} onChange={(e) => setHealthForm({ ...healthForm, dentalCheckupDone: e.target.checked })} /><label className="form-check-label">Dental Checkup</label></div></div>
              <div className="col-md-3"><div className="form-check mt-3"><input className="form-check-input" type="checkbox" checked={healthForm.psychologicalCheckupDone} onChange={(e) => setHealthForm({ ...healthForm, psychologicalCheckupDone: e.target.checked })} /><label className="form-check-label">Psych Checkup</label></div></div>
            </div>
          ) : null}

          {formType === 'intervention-plan' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><select className="form-select" value={planForm.residentId} onChange={(e) => setPlanForm({ ...planForm, residentId: Number(e.target.value) })}><option value={0}>Select</option>{residents.map((r) => <option key={r.residentId} value={r.residentId}>{r.internalCode}</option>)}</select></div>
              <div className="col-md-3"><label className="form-label">Category</label><select className="form-select" value={planForm.planCategory} onChange={(e) => setPlanForm({ ...planForm, planCategory: e.target.value })}><option>Safety</option><option>Psychosocial</option><option>Education</option><option>Physical Health</option><option>Legal</option><option>Reintegration</option></select></div>
              <div className="col-md-3"><label className="form-label">Target Date</label><input className="form-control" type="date" value={planForm.targetDate} onChange={(e) => setPlanForm({ ...planForm, targetDate: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Status</label><select className="form-select" value={planForm.status} onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}><option>Open</option><option>In Progress</option><option>Achieved</option><option>On Hold</option><option>Closed</option></select></div>
              <div className="col-md-6"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={planForm.planDescription} onChange={(e) => setPlanForm({ ...planForm, planDescription: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Services</label><input className="form-control" value={planForm.servicesProvided} onChange={(e) => setPlanForm({ ...planForm, servicesProvided: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Conference Date</label><input className="form-control" type="date" value={planForm.caseConferenceDate} onChange={(e) => setPlanForm({ ...planForm, caseConferenceDate: e.target.value })} /></div>
            </div>
          ) : null}

          {formType === 'incident-report' ? (
            <div className="row g-2">
              <div className="col-md-3"><label className="form-label">Resident</label><select className="form-select" value={incidentForm.residentId} onChange={(e) => setIncidentForm({ ...incidentForm, residentId: Number(e.target.value) })}><option value={0}>Select</option>{residents.map((r) => <option key={r.residentId} value={r.residentId}>{r.internalCode}</option>)}</select></div>
              <div className="col-md-3"><label className="form-label">Date</label><input className="form-control" type="date" value={incidentForm.incidentDate} onChange={(e) => setIncidentForm({ ...incidentForm, incidentDate: e.target.value })} /></div>
              <div className="col-md-3"><label className="form-label">Type</label><select className="form-select" value={incidentForm.incidentType} onChange={(e) => setIncidentForm({ ...incidentForm, incidentType: e.target.value })}><option>Behavioral</option><option>Medical</option><option>Security</option><option>RunawayAttempt</option><option>SelfHarm</option><option>ConflictWithPeer</option><option>PropertyDamage</option></select></div>
              <div className="col-md-3"><label className="form-label">Severity</label><select className="form-select" value={incidentForm.severity} onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></div>
              <div className="col-md-6"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={incidentForm.description} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label">Response Taken</label><textarea className="form-control" rows={2} value={incidentForm.responseTaken} onChange={(e) => setIncidentForm({ ...incidentForm, responseTaken: e.target.value })} /></div>
              <div className="col-md-2"><div className="form-check mt-3"><input className="form-check-input" type="checkbox" checked={incidentForm.resolved} onChange={(e) => setIncidentForm({ ...incidentForm, resolved: e.target.checked })} /><label className="form-check-label">Resolved</label></div></div>
              {incidentForm.resolved ? <div className="col-md-3"><label className="form-label">Resolution Date</label><input className="form-control" type="date" value={incidentForm.resolutionDate} onChange={(e) => setIncidentForm({ ...incidentForm, resolutionDate: e.target.value })} /></div> : null}
              <div className="col-md-2"><div className="form-check mt-3"><input className="form-check-input" type="checkbox" checked={incidentForm.followUpRequired} onChange={(e) => setIncidentForm({ ...incidentForm, followUpRequired: e.target.checked })} /><label className="form-check-label">Follow-Up</label></div></div>
            </div>
          ) : null}

          <button className="btn btn-primary mt-2" onClick={submitSelectedForm}>Submit Form</button>
          {formResult ? <p className="mt-2 mb-0">{formResult}</p> : null}

          {formsTimeline ? (
            <div className="mt-3">
              <h6>Submitted Forms (read-only)</h6>
              <p className="text-muted mb-2">Click a row to view details. If a correction is needed, submit a new entry.</p>
              <FilterSortTable columns={['recordType', 'date', 'submittedBy']} rows={flattenTimeline(formsTimeline.timeline)}
                onRowClick={(row) => setFormDetailView(row)} />
              {formDetailView ? (
                <div className="border rounded p-3 mt-2">
                  <div className="d-flex justify-content-between"><h6>{formDetailView.recordType} Detail</h6><button className="btn btn-sm btn-outline-secondary" onClick={() => setFormDetailView(null)}>Close</button></div>
                  <div className="d-flex flex-wrap gap-2">
                    {Object.entries(formDetailView._raw ?? {}).map(([key, value]) => (
                      <div key={key} className="metric-pill"><strong>{key}</strong>: {String(value ?? '')}</div>
                    ))}
                  </div>
                </div>
              ) : null}
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
                  <button className="btn btn-sm btn-outline-success" onClick={() => toggleTodo(todo.todoId)}>{todo.isCompleted ? 'Undo' : 'Done'}</button>
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

/* ════════════════════════════════════════════════════════════════
   DONOR DASHBOARD
   ════════════════════════════════════════════════════════════════ */
function DonorDashboard() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [newDonation, setNewDonation] = useState({ donationType: 'Monetary', donationDate: '', isRecurring: false, channelSource: 'Direct', amount: 0, estimatedValue: 0, campaignName: '', impactUnit: 'pesos' });
  const [message, setMessage] = useState('');

  async function loadDonorData() {
    apiFetch('/api/dashboard/donor').then(setOverview).catch(() => setOverview(null));
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

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'history', 'manage']} onSelect={setTab} />
      {tab === 'overview' ? <MetricsCard title="Your Donation Summary" data={overview} /> : null}
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
      ) : null}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ════════════════════════════════════════════════════════════════ */
function TabBar({ tabs, current, onSelect }: { tabs: string[]; current: string; onSelect: (v: string) => void }) {
  return (
    <ul className="nav nav-tabs mb-3 app-tab-nav">
      {tabs.map((t) => <li key={t} className="nav-item"><button className={`nav-link ${current === t ? 'active' : ''}`} onClick={() => onSelect(t)} type="button">{t}</button></li>)}
    </ul>
  );
}

function ScheduleCalendar({ title, appointments, residents, onFillOutForm, onAddEvent, onEditEvent, onDeleteEvent, onToggleComplete }: {
  title: string; appointments: any[]; residents: any[];
  onFillOutForm?: (residentId?: number) => void; onAddEvent?: () => void; onEditEvent?: (a: any) => void; onDeleteEvent?: (a: any) => void; onToggleComplete?: (a: any, c: boolean) => void;
}) {
  const now = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const totalCells = Math.ceil((startWeekday + totalDays) / 7) * 7;
  const days = Array.from({ length: totalCells }, (_, i) => i - startWeekday + 1);

  const residentCodeMap = new Map<number, string>();
  residents.forEach((r) => residentCodeMap.set(r.residentId, r.internalCode));

  const eventMap = new Map<number, any[]>();
  appointments.forEach((appt) => {
    const parts = String(appt.appointmentDate ?? '').split('-');
    if (parts.length !== 3) return;
    const [y, m, d] = [Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])];
    if (y === year && m === month) { if (!eventMap.has(d)) eventMap.set(d, []); eventMap.get(d)?.push(appt); }
  });

  return (
    <DataCard title={`${title} - ${monthName} ${year}`}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setViewDate(new Date(year, month - 1, 1))}>{'<'}</button>
        <strong>{`${monthName} ${year}`}</strong>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setViewDate(new Date(year, month + 1, 1))}>{'>'}</button>
      </div>
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((n) => <div key={n} className="calendar-head">{n}</div>)}
        {days.map((day, i) => {
          const inMonth = day > 0 && day <= totalDays;
          const dayEvents = inMonth ? (eventMap.get(day) ?? []) : [];
          const isToday = inMonth && year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
          return (
            <div key={`${day}-${i}`} className={`calendar-day ${inMonth ? '' : 'calendar-day--muted'} ${isToday ? 'calendar-day--today' : ''}`}>
              {inMonth ? <div className="calendar-day-number">{day}</div> : null}
              {dayEvents.slice(0, 3).map((appt) => (
                <div key={appt.appointmentId} className="calendar-event-wrap">
                  <div className="calendar-event">{String(appt.eventName ?? `Appt: ${appt.residentInternalCode ?? residentCodeMap.get(appt.residentId) ?? `LS${appt.residentId}`}`)}</div>
                  <div className="calendar-popover">
                    <div><strong>Name:</strong> {String(appt.eventName ?? '-')}</div>
                    <div><strong>Resident:</strong> {String(appt.residentInternalCode ?? residentCodeMap.get(appt.residentId) ?? '-')}</div>
                    <div><strong>Date:</strong> {formatDateValue(appt.appointmentDate)}</div>
                    <div><strong>Time:</strong> {formatTimeValue(appt.appointmentTime)}</div>
                    <div><strong>Type:</strong> {String(appt.appointmentType ?? '')}</div>
                    <div><strong>Status:</strong> {String(appt.status ?? '')}</div>
                    <div className="d-flex gap-2 mt-1 flex-wrap">
                      {onFillOutForm ? <button type="button" className="calendar-form-link" onClick={() => onFillOutForm(appt.residentId)}>Fill form</button> : null}
                      {onEditEvent ? <button type="button" className="calendar-form-link" onClick={() => onEditEvent(appt)}>Edit</button> : null}
                      {onDeleteEvent ? <button type="button" className="calendar-form-link" onClick={() => onDeleteEvent(appt)}>Delete</button> : null}
                      {onToggleComplete && isTodayOrPast(appt.appointmentDate) ? <button type="button" className="calendar-form-link" onClick={() => onToggleComplete(appt, String(appt.status) !== 'Completed')}>{String(appt.status) === 'Completed' ? 'Undo Complete' : 'Complete'}</button> : null}
                    </div>
                  </div>
                </div>
              ))}
              {dayEvents.length > 3 ? <div className="calendar-more">+{dayEvents.length - 3} more</div> : null}
            </div>
          );
        })}
      </div>
      {onAddEvent ? <div className="d-flex justify-content-end mt-2"><button type="button" className="btn btn-primary btn-sm" onClick={onAddEvent}>Add Event</button></div> : null}
    </DataCard>
  );
}

function DataCard({ title, children }: { title: string; children: ReactNode }) {
  return <section className="card p-3 mb-3"><h5>{title}</h5>{children}</section>;
}

function MetricsCard({ title, data }: { title: string; data: any }) {
  return <DataCard title={title}><MetricsInline data={data} /></DataCard>;
}

function MetricsInline({ data }: { data: any }) {
  if (!data) return <p className="text-muted">Loading...</p>;
  return <div className="d-flex flex-wrap gap-2">{Object.entries(data).map(([k, v]) => {
    if (typeof v === 'object' && v !== null) return null;
    return <div key={k} className="metric-pill"><strong>{k}</strong>: {String(v)}</div>;
  })}</div>;
}

function FilterSortTable({ columns, rows, onRowClick }: { columns: string[]; rows: any[]; onRowClick?: (row: any) => void }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(columns[0] ?? '');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => { setSortBy(columns[0] ?? ''); setPage(1); }, [columns.join('|'), rows.length]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.toLowerCase();
    return rows.filter((row) => columns.some((c) => String(row[c] ?? '').toLowerCase().includes(term)));
  }, [rows, columns, search]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const l = String(a[sortBy] ?? '').toLowerCase();
      const r = String(b[sortBy] ?? '').toLowerCase();
      if (l < r) return sortDir === 'asc' ? -1 : 1;
      if (l > r) return sortDir === 'asc' ? 1 : -1;
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
        <div className="col-md-6"><input className="form-control form-control-sm" placeholder="Search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        <div className="col-md-4"><select className="form-select form-select-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>{columns.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
        <div className="col-md-2"><button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>{sortDir === 'asc' ? 'Asc' : 'Desc'}</button></div>
      </div>
      <div className="table-responsive">
        <table className="table table-sm table-striped">
          <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} onClick={() => onRowClick?.(row)} style={onRowClick ? { cursor: 'pointer' } : undefined}>
                {columns.map((c) => <td key={c}>{String(row[c] ?? '')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">Page {currentPage} of {totalPages} ({sorted.length} rows)</small>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Prev</button>
          <button className="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function flattenTimeline(timeline: any) {
  const rows: any[] = [];
  (timeline?.processRecordings ?? []).forEach((x: any) => rows.push({ recordType: 'Process Recording', date: x.sessionDate, submittedBy: x.socialWorker, _raw: x }));
  (timeline?.homeVisitations ?? []).forEach((x: any) => rows.push({ recordType: 'Home Visitation', date: x.visitDate, submittedBy: x.socialWorker, _raw: x }));
  (timeline?.educationRecords ?? []).forEach((x: any) => rows.push({ recordType: 'Education Record', date: x.recordDate, submittedBy: 'Staff', _raw: x }));
  (timeline?.healthRecords ?? []).forEach((x: any) => rows.push({ recordType: 'Health Record', date: x.recordDate, submittedBy: 'Staff', _raw: x }));
  (timeline?.interventionPlans ?? []).forEach((x: any) => rows.push({ recordType: 'Intervention Plan', date: x.targetDate, submittedBy: 'Staff', _raw: x }));
  (timeline?.incidents ?? []).forEach((x: any) => rows.push({ recordType: 'Incident Report', date: x.incidentDate, submittedBy: x.reportedBy, _raw: x }));
  return rows;
}

function formatDateValue(v: any) { return String(v ?? '') || '-'; }
function formatTimeValue(v: any) { const r = String(v ?? ''); return r ? r.slice(0, 5) : '-'; }

function isTodayOrPast(dateValue: any) {
  const raw = String(dateValue ?? '');
  if (!raw) return false;
  const d = new Date(`${raw}T00:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return d.getTime() <= today.getTime();
}

function readCookie(name: string) {
  const match = document.cookie.split('; ').find((v) => v.startsWith(`${name}=`));
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
      await apiFetch('/api/auth/accept-cookies', { method: 'POST', body: JSON.stringify({ accepted }) });
      await refreshUser();
    }
    setClosed(true);
  }

  return (
    <div className="cookie-banner shadow-sm">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div><strong>Cookie Preference</strong><p className="mb-0">We use essential cookies for login and optional cookies for preferences.</p></div>
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
