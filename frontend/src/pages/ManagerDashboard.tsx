import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { TabBar } from '../components/TabBar';
import { ResidentIntakeModal } from '../components/ResidentIntakeModal';
import { DataCard } from '../components/DataCard';
import { MetricsCard } from '../components/MetricsCard';
import { MetricsInline } from '../components/MetricsInline';
import { FilterSortTable } from '../components/FilterSortTable';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { formatTimeValue } from '../utils/helpers';

export function ManagerDashboard() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [includeClosed, setIncludeClosed] = useState(false);
  const [mgrReport, setMgrReport] = useState<any>(null);
  const [mgrResidentOutcomes, setMgrResidentOutcomes] = useState<any>(null);
  const [mgrServicesProvided, setMgrServicesProvided] = useState<any>(null);
  const [mgrIncludeClosedReports, setMgrIncludeClosedReports] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState<number | ''>('');
  const [selectedResidentDetail, setSelectedResidentDetail] = useState<any>(null);
  const [reintegrationType, setReintegrationType] = useState('None');
  const [reintegrationStatus, setReintegrationStatus] = useState('Not Started');
  const [actionMessage, setActionMessage] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | ''>('');
  const [partnerAssignments, setPartnerAssignments] = useState<any[]>([]);
  const [acctEmail, setAcctEmail] = useState('');
  const [acctPassword, setAcctPassword] = useState('');
  const [acctName, setAcctName] = useState('');
  const [acctMsg, setAcctMsg] = useState('');
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);
  const [selectedWorkerCode, setSelectedWorkerCode] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState<any>({ residentId: 0, eventDate: '', eventTime: '09:00', eventTypeChoice: 'Meeting', customEventType: '', eventName: '', notes: '' });
  const [eventMsg, setEventMsg] = useState('');
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  async function loadManagerData() {
    apiFetch('/api/dashboard/manager').then(setOverview).catch(() => setOverview(null));
    apiFetch<any>(`/api/residents?includeClosed=${includeClosed}`).then((r) => setResidents(r.data ?? [])).catch(() => setResidents([]));
    apiFetch<any>('/api/donors/donations').then((r) => setDonations(r.data ?? [])).catch(() => setDonations([]));
    apiFetch<any>('/api/partners').then((r) => setPartners(r.data ?? [])).catch(() => setPartners([]));
    apiFetch<any>('/api/workplanner/appointments?page=1&pageSize=500').then((r) => setAppointments(r.data ?? [])).catch(() => setAppointments([]));
    apiFetch<any[]>('/api/reports/case-conferences').then(setConferences).catch(() => setConferences([]));
    apiFetch(`/api/reports/overview?includeClosedCases=${mgrIncludeClosedReports}`).then(setMgrReport).catch(() => setMgrReport(null));
    apiFetch(`/api/reports/resident-outcomes?includeClosedCases=${mgrIncludeClosedReports}`).then(setMgrResidentOutcomes).catch(() => setMgrResidentOutcomes(null));
    apiFetch('/api/reports/services-provided').then(setMgrServicesProvided).catch(() => setMgrServicesProvided(null));
  }

  useEffect(() => { loadManagerData(); }, [includeClosed, mgrIncludeClosedReports]);

  useEffect(() => {
    apiFetch<any[]>('/api/auth/available-workers')
      .then(setAvailableWorkers)
      .catch(() => setAvailableWorkers([]));
  }, []);

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
    if (!selectedResidentId || !window.confirm('Are you sure you want to close this case?')) return;
    await apiFetch(`/api/residents/${selectedResidentId}/close`, { method: 'POST' });
    setActionMessage('Case closed.');
    await loadManagerData();
    setSelectedResidentId('');
  }

  async function reopenCase() {
    if (!selectedResidentId || !window.confirm('Are you sure you want to reopen this case?')) return;
    await apiFetch(`/api/residents/${selectedResidentId}/reopen`, { method: 'POST' });
    setActionMessage('Case reopened.');
    await loadManagerData();
    setSelectedResidentId('');
  }

  async function createWorkerAccount() {
    setAcctMsg('');
    if (!selectedWorkerCode) {
      setAcctMsg('Please select a Social Worker.');
      return;
    }
    try {
      await apiFetch('/api/auth/create-account', { method: 'POST', body: JSON.stringify({ email: acctEmail, password: acctPassword, displayName: acctName, role: 'SocialWorker', workerCode: selectedWorkerCode }) });
      setAcctMsg('Social Worker account created and linked.');
      setAcctEmail(''); setAcctPassword(''); setAcctName(''); setSelectedWorkerCode('');
    } catch (e) { setAcctMsg((e as Error).message); }
  }

  async function saveManagerEvent() {
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
      await loadManagerData();
    } catch (e) { setEventMsg((e as Error).message); }
  }

  async function deleteManagerEvent(appointmentId: number) { if (!window.confirm('Delete this event?')) return; await apiFetch(`/api/workplanner/appointments/${appointmentId}`, { method: 'DELETE' }); await loadManagerData(); }
  async function toggleManagerEventComplete(appointmentId: number, completed: boolean) { await apiFetch(`/api/workplanner/appointments/${appointmentId}/complete`, { method: 'POST', body: JSON.stringify({ completed }) }); await loadManagerData(); }
  function editManagerEvent(appointment: any) {
    const knownTypes = ['Meeting', 'Staff Check-in', 'Case Review'];
    const isCustom = !knownTypes.includes(String(appointment.appointmentType ?? ''));
    setEditingAppointmentId(appointment.appointmentId);
    setEventForm({ residentId: appointment.residentId ?? 0, eventDate: String(appointment.appointmentDate ?? ''), eventTime: formatTimeValue(appointment.appointmentTime), eventTypeChoice: isCustom ? 'Custom' : String(appointment.appointmentType ?? 'Meeting'), customEventType: isCustom ? String(appointment.appointmentType ?? '') : '', eventName: String(appointment.eventName ?? ''), notes: String(appointment.notes ?? '') });
    setShowEventModal(true);
  }

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'schedule', 'caseload', 'donors', 'appointments', 'partners', 'conferences', 'reports']} onSelect={setTab} />

      {tab === 'overview' && (
        <>
          <MetricsCard title="Regional Snapshot" data={overview} />
          <DataCard title="Create Social Worker Account">
            <div className="row g-2">
              <div className="col-md-2"><input className="form-control" placeholder="Name" value={acctName} onChange={(e) => setAcctName(e.target.value)} /></div>
              <div className="col-md-2"><input className="form-control" placeholder="Email" value={acctEmail} onChange={(e) => setAcctEmail(e.target.value)} /></div>
              <div className="col-md-2"><input className="form-control" type="password" placeholder="Password (12+ chars)" value={acctPassword} onChange={(e) => setAcctPassword(e.target.value)} /></div>
              <div className="col-md-3">
                <select className="form-control" value={selectedWorkerCode} onChange={(e) => setSelectedWorkerCode(e.target.value)}>
                  <option value="">-- Select Social Worker --</option>
                  {availableWorkers.map((w) => (
                    <option key={w.socialWorkerId} value={w.workerCode}>
                      {w.workerCode} - {w.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3"><button className="btn btn-primary w-100" onClick={createWorkerAccount}>Create Worker</button></div>
            </div>
            {acctMsg && <p className="mt-2 mb-0">{acctMsg}</p>}
          </DataCard>
        </>
      )}

      {tab === 'schedule' && (
        <DataCard title="Manager Schedule">
          <ScheduleCalendar title="Regional Manager Schedule" appointments={appointments} residents={residents}
            onAddEvent={() => { setEditingAppointmentId(null); setEventForm({ residentId: 0, eventDate: '', eventTime: '09:00', eventTypeChoice: 'Meeting', customEventType: '', eventName: '', notes: '' }); setShowEventModal(true); }}
            onEditEvent={editManagerEvent}
            onDeleteEvent={(appt) => deleteManagerEvent(appt.appointmentId)}
            onToggleComplete={(appt, completed) => toggleManagerEventComplete(appt.appointmentId, completed)} />
          {showEventModal && (
            <div className="event-modal-backdrop"><div className="event-modal-card">
              <h5 className="mb-2">{editingAppointmentId ? 'Edit Event' : 'Add Event'}</h5>
              <div className="row g-2">
                <div className="col-md-4"><label className="form-label">Date</label><input className="form-control" type="date" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Time</label><input className="form-control" type="time" value={eventForm.eventTime} onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })} /></div>
                <div className="col-md-4"><label className="form-label">Type</label><select className="form-select" value={eventForm.eventTypeChoice} onChange={(e) => setEventForm({ ...eventForm, eventTypeChoice: e.target.value })}><option>Meeting</option><option>Staff Check-in</option><option>Case Review</option><option>Custom</option></select></div>
              </div>
              {eventForm.eventTypeChoice === 'Custom' && <div className="mt-2"><input className="form-control" placeholder="Custom type" value={eventForm.customEventType} onChange={(e) => setEventForm({ ...eventForm, customEventType: e.target.value })} /></div>}
              <div className="mt-2"><input className="form-control" placeholder="Event name" value={eventForm.eventName} onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })} /></div>
              <div className="mt-2"><textarea className="form-control" rows={2} placeholder="Notes" value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })} /></div>
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-secondary" onClick={() => { setShowEventModal(false); setEditingAppointmentId(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={saveManagerEvent}>{editingAppointmentId ? 'Update' : 'Save'}</button>
              </div>
              {eventMsg && <p className="mt-2 mb-0">{eventMsg}</p>}
            </div></div>
          )}
        </DataCard>
      )}

      {tab === 'caseload' && (
        <DataCard title="Caseload">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
            <div className="form-check mb-0">
              <input id="includeClosedCases" className="form-check-input" type="checkbox" checked={includeClosed} onChange={(e) => setIncludeClosed(e.target.checked)} />
              <label htmlFor="includeClosedCases" className="form-check-label">Include Closed Cases</label>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowIntakeModal(true)}>
              New resident intake
            </button>
          </div>
          <FilterSortTable columns={['residentId', 'internalCode', 'caseStatus', 'currentRiskLevel', 'reintegrationStatus', 'assignedSocialWorker']} rows={residents} />
          <hr />
          <label className="form-label">Open Case Profile</label>
          <select className="form-select mb-2" value={selectedResidentId} onChange={(e) => setSelectedResidentId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Select resident</option>
            {residents.map((r) => <option key={r.residentId} value={r.residentId}>{r.internalCode} ({r.caseStatus})</option>)}
          </select>
          {selectedResidentDetail && (
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
            </div>
          )}
          {actionMessage && <p className="mt-2 mb-0">{actionMessage}</p>}
          <ResidentIntakeModal
            open={showIntakeModal}
            onClose={() => setShowIntakeModal(false)}
            availableWorkers={availableWorkers}
            onSaved={async (residentId) => {
              setActionMessage('Resident created.');
              await loadManagerData();
              setSelectedResidentId(residentId);
            }}
          />
        </DataCard>
      )}

      {tab === 'donors' && <DataCard title="Donations"><FilterSortTable columns={['supporterId', 'donationType', 'donationDate', 'amount', 'campaignName', 'channelSource', 'isRecurring']} rows={donations} /></DataCard>}
      {tab === 'appointments' && <DataCard title="Staff Appointments"><FilterSortTable columns={['residentInternalCode', 'socialWorker', 'appointmentDate', 'appointmentType', 'sessionFormat', 'status']} rows={appointments} /></DataCard>}

      {tab === 'partners' && (
        <DataCard title="Partners (View Only)">
          <FilterSortTable columns={['partnerName', 'roleType', 'region', 'status', 'startDate', 'endDate']} rows={partners}
            onRowClick={(row) => setSelectedPartnerId(row.partnerId)} />
          {selectedPartnerId && (
            <div className="border rounded p-3 mt-2">
              <div className="d-flex justify-content-between"><h6>Partner Assignments</h6><button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedPartnerId('')}>Close</button></div>
              {partnerAssignments.length === 0 ? <p className="text-muted">No assignments.</p> : (
                <FilterSortTable columns={['safehouseId', 'programArea', 'assignmentStart', 'assignmentEnd', 'isPrimary', 'status']} rows={partnerAssignments} />
              )}
            </div>
          )}
        </DataCard>
      )}

      {tab === 'conferences' && <DataCard title="Case Conferences"><FilterSortTable columns={['internalCode', 'conferenceDate', 'planCategories', 'planCount']} rows={conferences} /></DataCard>}

      {tab === 'reports' && (
        <>
          <div className="form-check mb-3">
            <input id="mgrIncludeClosedReports" className="form-check-input" type="checkbox" checked={mgrIncludeClosedReports} onChange={(e) => setMgrIncludeClosedReports(e.target.checked)} />
            <label htmlFor="mgrIncludeClosedReports" className="form-check-label">Include Closed Cases</label>
          </div>
          <DataCard title="Resident Outcomes"><MetricsInline data={mgrReport} />{mgrResidentOutcomes && (<><h6 className="mt-3">By Case Category</h6><FilterSortTable columns={['category', 'count']} rows={mgrResidentOutcomes.byCategory ?? []} /></>)}</DataCard>
          <DataCard title="Services Provided">{mgrServicesProvided ? (<><h6>Caring</h6><FilterSortTable columns={['visitType', 'count']} rows={mgrServicesProvided.caring ?? []} /></>) : <p className="text-muted">Loading...</p>}</DataCard>
        </>
      )}
    </div>
  );
}
