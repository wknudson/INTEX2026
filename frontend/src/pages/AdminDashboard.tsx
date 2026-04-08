import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { TabBar } from '../components/TabBar';
import { DataCard } from '../components/DataCard';
import { MetricsCard } from '../components/MetricsCard';
import { MetricsInline } from '../components/MetricsInline';
import { FilterSortTable } from '../components/FilterSortTable';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { formatTimeValue } from '../utils/helpers';

export function AdminDashboard() {
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

  const [selectedSafehouseId, setSelectedSafehouseId] = useState<number | ''>('');
  const [safehouseDetail, setSafehouseDetail] = useState<any>(null);

  const [selectedPartnerId, setSelectedPartnerId] = useState<number | ''>('');
  const [partnerAssignments, setPartnerAssignments] = useState<any[]>([]);

  const [showSupporterForm, setShowSupporterForm] = useState(false);
  const [editingSupporterId, setEditingSupporterId] = useState<number | null>(null);
  const [supporterForm, setSupporterForm] = useState<any>({ displayName: '', supporterType: 'MonetaryDonor', relationshipType: 'Local', region: '', country: 'Philippines', email: '', phone: '', status: 'Active', acquisitionChannel: 'Website' });
  const [supporterMsg, setSupporterMsg] = useState('');

  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<number | null>(null);
  const [partnerForm, setPartnerForm] = useState<any>({ partnerName: '', partnerType: '', roleType: '', contactName: '', email: '', phone: '', region: '', status: 'Active', notes: '' });
  const [partnerMsg, setPartnerMsg] = useState('');

  const [acctEmail, setAcctEmail] = useState('');
  const [acctPassword, setAcctPassword] = useState('');
  const [acctName, setAcctName] = useState('');
  const [acctRole, setAcctRole] = useState('RegionalManager');
  const [acctMsg, setAcctMsg] = useState('');

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
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
      if (editingAppointmentId) {
        await apiFetch(`/api/workplanner/appointments/${editingAppointmentId}`, { method: 'PUT', body: JSON.stringify({ residentId: eventForm.residentId || 0, eventName, appointmentDate: eventForm.eventDate, appointmentTime: eventForm.eventTime, appointmentType: eventType, sessionFormat: 'Individual', notes: eventForm.notes, status: 'Scheduled' }) });
        setEventMsg('Event updated.');
      } else {
        await apiFetch('/api/workplanner/appointments', { method: 'POST', body: JSON.stringify({ residentId: eventForm.residentId || 0, eventName, appointmentDate: eventForm.eventDate, appointmentTime: eventForm.eventTime, appointmentType: eventType, sessionFormat: 'Individual', notes: eventForm.notes, status: 'Scheduled' }) });
        setEventMsg('Event created.');
      }
      setShowEventModal(false);
      setEditingAppointmentId(null);
      await loadAdminData();
    } catch (e) { setEventMsg((e as Error).message); }
  }

  async function deleteAdminEvent(appointmentId: number) { if (!window.confirm('Delete this event?')) return; await apiFetch(`/api/workplanner/appointments/${appointmentId}`, { method: 'DELETE' }); await loadAdminData(); }
  async function toggleAdminEventComplete(appointmentId: number, completed: boolean) { await apiFetch(`/api/workplanner/appointments/${appointmentId}/complete`, { method: 'POST', body: JSON.stringify({ completed }) }); await loadAdminData(); }
  function editAdminEvent(appointment: any) {
    const knownTypes = ['Meeting', 'Speaking Event', 'Charity Event', 'Marketing', 'Awareness'];
    const isCustom = !knownTypes.includes(String(appointment.appointmentType ?? ''));
    setEditingAppointmentId(appointment.appointmentId);
    setEventForm({ residentId: appointment.residentId ?? 0, eventDate: String(appointment.appointmentDate ?? ''), eventTime: formatTimeValue(appointment.appointmentTime), eventTypeChoice: isCustom ? 'Custom' : String(appointment.appointmentType ?? 'Meeting'), customEventType: isCustom ? String(appointment.appointmentType ?? '') : '', eventName: String(appointment.eventName ?? ''), notes: String(appointment.notes ?? '') });
    setShowEventModal(true);
  }

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'schedule', 'safehouses', 'donors', 'partners', 'reports']} onSelect={setTab} />

      {tab === 'overview' && (
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
            {acctMsg && <p className="mt-2 mb-0">{acctMsg}</p>}
          </DataCard>
        </>
      )}

      {tab === 'schedule' && (
        <DataCard title="Admin Schedule">
          <ScheduleCalendar title="Admin Schedule" appointments={appointments} residents={[]}
            onAddEvent={() => { setEditingAppointmentId(null); setEventForm({ residentId: 0, eventDate: '', eventTime: '09:00', eventTypeChoice: 'Meeting', customEventType: '', eventName: '', notes: '' }); setShowEventModal(true); }}
            onEditEvent={editAdminEvent}
            onDeleteEvent={(appt) => deleteAdminEvent(appt.appointmentId)}
            onToggleComplete={(appt, completed) => toggleAdminEventComplete(appt.appointmentId, completed)} />
          {showEventModal && (
            <div className="event-modal-backdrop"><div className="event-modal-card">
              <h5 className="mb-2">{editingAppointmentId ? 'Edit Event' : 'Add Event'}</h5>
              <div className="row g-2">
                <div className="col-md-4"><label className="form-label">Date</label><input className="form-control" type="date" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Time</label><input className="form-control" type="time" value={eventForm.eventTime} onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Type</label><select className="form-select" value={eventForm.eventTypeChoice} onChange={(e) => setEventForm({ ...eventForm, eventTypeChoice: e.target.value })}><option>Meeting</option><option>Speaking Event</option><option>Charity Event</option><option>Marketing</option><option>Awareness</option><option>Custom</option></select></div>
              </div>
              {eventForm.eventTypeChoice === 'Custom' && <div className="mt-2"><input className="form-control" placeholder="Custom event type" value={eventForm.customEventType} onChange={(e) => setEventForm({ ...eventForm, customEventType: e.target.value })} /></div>}
              <div className="mt-2"><input className="form-control" placeholder="Event name" value={eventForm.eventName} onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })} /></div>
              <div className="mt-2"><textarea className="form-control" rows={2} placeholder="Notes" value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })} /></div>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-secondary" onClick={() => { setShowEventModal(false); setEditingAppointmentId(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={saveAdminEvent}>{editingAppointmentId ? 'Update' : 'Save'}</button>
              </div>
              {eventMsg && <p className="mt-2 mb-0">{eventMsg}</p>}
            </div></div>
          )}
        </DataCard>
      )}

      {tab === 'safehouses' && (
        <DataCard title="Safehouses">
          <div className="form-check mb-2">
            <input id="includeInactive" className="form-check-input" type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
            <label htmlFor="includeInactive" className="form-check-label">Include Inactive</label>
          </div>
          <FilterSortTable columns={['safehouseId', 'name', 'region', 'currentOccupancy', 'capacityGirls', 'status']} rows={safehouses} onRowClick={(row) => setSelectedSafehouseId(row.safehouseId)} />
          {safehouseDetail && (
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
          )}
        </DataCard>
      )}

      {tab === 'donors' && (
        <>
          <DataCard title="Supporters">
            <button className="btn btn-sm btn-primary mb-2" onClick={() => { setShowSupporterForm(true); setEditingSupporterId(null); setSupporterForm({ displayName: '', supporterType: 'MonetaryDonor', relationshipType: 'Local', region: '', country: 'Philippines', email: '', phone: '', status: 'Active', acquisitionChannel: 'Website' }); }}>New Supporter</button>
            <FilterSortTable columns={['supporterId', 'displayName', 'supporterType', 'relationshipType', 'region', 'country', 'status', 'acquisitionChannel']} rows={supporters}
              onRowClick={(row) => { setEditingSupporterId(row.supporterId); setSupporterForm({ ...row }); setShowSupporterForm(true); }} />
            {supporterMsg && <p className="mt-2 mb-0">{supporterMsg}</p>}
          </DataCard>
          {showSupporterForm && (
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
          )}
          <DataCard title="Donation History">
            <FilterSortTable columns={['donationId', 'supporterId', 'donationType', 'donationDate', 'amount', 'estimatedValue', 'campaignName', 'isRecurring']} rows={donations} />
          </DataCard>
        </>
      )}

      {tab === 'partners' && (
        <DataCard title="Partners">
          <button className="btn btn-sm btn-primary mb-2" onClick={() => { setShowPartnerForm(true); setEditingPartnerId(null); setPartnerForm({ partnerName: '', partnerType: '', roleType: '', contactName: '', email: '', phone: '', region: '', status: 'Active', notes: '' }); }}>New Partner</button>
          <FilterSortTable columns={['partnerId', 'partnerName', 'partnerType', 'roleType', 'region', 'status', 'startDate', 'endDate']} rows={partners}
            onRowClick={(row) => { setSelectedPartnerId(row.partnerId); setEditingPartnerId(row.partnerId); setPartnerForm({ ...row }); setShowPartnerForm(true); }} />
          {showPartnerForm && (
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
              {partnerMsg && <p className="mt-2 mb-0">{partnerMsg}</p>}
            </div>
          )}
          {selectedPartnerId && (
            <div className="border rounded p-3 mt-2">
              <div className="d-flex justify-content-between"><h6>Assignments</h6><button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedPartnerId('')}>Close</button></div>
              {partnerAssignments.length === 0 ? <p className="text-muted">No assignments.</p> : (
                <FilterSortTable columns={['safehouseId', 'programArea', 'assignmentStart', 'assignmentEnd', 'isPrimary', 'status']} rows={partnerAssignments} />
              )}
            </div>
          )}
        </DataCard>
      )}

      {tab === 'reports' && (
        <>
          <div className="form-check mb-3">
            <input id="includeClosedReports" className="form-check-input" type="checkbox" checked={includeClosedReports} onChange={(e) => setIncludeClosedReports(e.target.checked)} />
            <label htmlFor="includeClosedReports" className="form-check-label">Include Closed Cases</label>
          </div>
          <DataCard title="Resident Outcomes"><MetricsInline data={report} />{residentOutcomes && (<><h6 className="mt-3">By Safehouse</h6><FilterSortTable columns={['safehouseId', 'count']} rows={residentOutcomes.bySafehouse ?? []} /><h6 className="mt-3">By Case Category</h6><FilterSortTable columns={['category', 'count']} rows={residentOutcomes.byCategory ?? []} /><h6 className="mt-3">By Risk Level</h6><FilterSortTable columns={['riskLevel', 'count']} rows={residentOutcomes.byRiskLevel ?? []} /></>)}</DataCard>
          <DataCard title="Services Provided">{servicesProvided ? (<><h6>Caring</h6><FilterSortTable columns={['visitType', 'count']} rows={servicesProvided.caring ?? []} /><h6 className="mt-3">Healing</h6><FilterSortTable columns={['sessionType', 'count']} rows={servicesProvided.healingByType ?? []} /></>) : <p className="text-muted">Loading...</p>}</DataCard>
          <a className="btn btn-sm btn-outline-primary mt-2" href="/api/reports/export/donations.csv">Export Donations CSV</a>
        </>
      )}
    </div>
  );
}
