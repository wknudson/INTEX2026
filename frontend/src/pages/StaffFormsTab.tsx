import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { DataCard } from '../components/DataCard';

export function StaffFormsTab() {
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [formType, setFormType] = useState('');
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 25;

  // Form state for individual forms
  const [processRecordingForm, setProcessRecordingForm] = useState({
    residentId: 0,
    sessionDate: '',
    sessionType: '',
    sessionDurationMinutes: 0,
    emotionalStateObserved: '',
    emotionalStateEnd: '',
    sessionNarrative: '',
    interventionsApplied: '',
    followUpActions: '',
    progressNoted: false,
    concernsFlagged: false,
    referralMade: false,
  });

  const [homeVisitationForm, setHomeVisitationForm] = useState({
    residentId: 0,
    visitDate: '',
    visitType: '',
    locationVisited: '',
    familyMembersPresent: '',
    purpose: '',
    observations: '',
    familyCooperationLevel: '',
    safetyConcernsNoted: false,
    followUpNeeded: false,
    followUpNotes: '',
    visitOutcome: '',
  });

  const [educationForm, setEducationForm] = useState({
    residentId: 0,
    recordDate: '',
    programName: '',
    courseName: '',
    educationLevel: '',
    schoolName: '',
    enrollmentStatus: '',
    attendanceRate: 0,
    progressPercent: 0,
    completionStatus: '',
    gpaLikeScore: 0,
    notes: '',
  });

  const [healthForm, setHealthForm] = useState({
    residentId: 0,
    recordDate: '',
    generalHealthScore: 0,
    nutritionScore: 0,
    sleepQualityScore: 0,
    energyLevelScore: 0,
    heightCm: 0,
    weightKg: 0,
    medicalCheckupDone: false,
    dentalCheckupDone: false,
    psychologicalCheckupDone: false,
    notes: '',
  });

  async function loadSubmissions() {
    try {
      const data: any = await apiFetch(`/api/forms/staff-submissions?page=${page}&pageSize=${pageSize}`);
      setSubmissions(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  async function loadResidents() {
    try {
      const data: any = await apiFetch('/api/residents');
      setResidents(data.data ?? []);
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  useEffect(() => {
    loadSubmissions();
    loadResidents();
  }, [page, pageSize]);

  async function submitProcessRecording() {
    setMessage('');
    try {
      await apiFetch('/api/forms/process-recording', {
        method: 'POST',
        body: JSON.stringify(processRecordingForm),
      });
      setMessage('Process Recording submitted successfully!');
      setProcessRecordingForm({
        residentId: 0,
        sessionDate: '',
        sessionType: '',
        sessionDurationMinutes: 0,
        emotionalStateObserved: '',
        emotionalStateEnd: '',
        sessionNarrative: '',
        interventionsApplied: '',
        followUpActions: '',
        progressNoted: false,
        concernsFlagged: false,
        referralMade: false,
      });
      setFormType('');
      setView('list');
      await loadSubmissions();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  async function submitHomeVisitation() {
    setMessage('');
    try {
      await apiFetch('/api/forms/home-visitation', {
        method: 'POST',
        body: JSON.stringify(homeVisitationForm),
      });
      setMessage('Home Visitation submitted successfully!');
      setHomeVisitationForm({
        residentId: 0,
        visitDate: '',
        visitType: '',
        locationVisited: '',
        familyMembersPresent: '',
        purpose: '',
        observations: '',
        familyCooperationLevel: '',
        safetyConcernsNoted: false,
        followUpNeeded: false,
        followUpNotes: '',
        visitOutcome: '',
      });
      setFormType('');
      setView('list');
      await loadSubmissions();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  async function submitEducationRecord() {
    setMessage('');
    try {
      await apiFetch('/api/forms/education-record', {
        method: 'POST',
        body: JSON.stringify(educationForm),
      });
      setMessage('Education Record submitted successfully!');
      setEducationForm({
        residentId: 0,
        recordDate: '',
        programName: '',
        courseName: '',
        educationLevel: '',
        schoolName: '',
        enrollmentStatus: '',
        attendanceRate: 0,
        progressPercent: 0,
        completionStatus: '',
        gpaLikeScore: 0,
        notes: '',
      });
      setFormType('');
      setView('list');
      await loadSubmissions();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  async function submitHealthRecord() {
    setMessage('');
    try {
      await apiFetch('/api/forms/health-record', {
        method: 'POST',
        body: JSON.stringify(healthForm),
      });
      setMessage('Health & Wellbeing Record submitted successfully!');
      setHealthForm({
        residentId: 0,
        recordDate: '',
        generalHealthScore: 0,
        nutritionScore: 0,
        sleepQualityScore: 0,
        energyLevelScore: 0,
        heightCm: 0,
        weightKg: 0,
        medicalCheckupDone: false,
        dentalCheckupDone: false,
        psychologicalCheckupDone: false,
        notes: '',
      });
      setFormType('');
      setView('list');
      await loadSubmissions();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  if (view === 'list') {
    return (
      <DataCard title="Forms & Case Files">
        <div className="mb-3">
          <button className="btn btn-primary" onClick={() => setView('create')}>
            + Add New Form
          </button>
        </div>

        {submissions.length === 0 ? (
          <p className="text-muted">No submitted forms yet.</p>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-sm table-striped">
                <thead className="table-light">
                  <tr>
                    <th>Resident</th>
                    <th>Form Type</th>
                    <th>Date</th>
                    <th>Submitted By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.formId}>
                      <td>{sub.internalCode}</td>
                      <td>{sub.formType}</td>
                      <td>{sub.dateSubmitted}</td>
                      <td>{sub.submittedBy}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setView('detail');
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {total > pageSize && (
              <nav className="mt-3">
                <ul className="pagination">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)}>
                      Previous
                    </button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">Page {page}</span>
                  </li>
                  <li className={`page-item ${page * pageSize >= total ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}

        {message && <p className="mt-3 alert alert-info">{message}</p>}
      </DataCard>
    );
  }

  if (view === 'detail') {
    const sub = selectedSubmission;
    const data = sub.data;

    return (
      <DataCard title={`${sub.formType} - ${sub.internalCode}`}>
        <button className="btn btn-secondary mb-3" onClick={() => setView('list')}>
          &larr; Back to List
        </button>

        <div className="row">
          {sub.formType === 'Process Recording' && (
            <>
              <div className="col-md-6">
                <label className="form-label fw-bold">Session Date</label>
                <p>{data.sessionDate}</p>
                <label className="form-label fw-bold">Session Type</label>
                <p>{data.sessionType}</p>
                <label className="form-label fw-bold">Duration (minutes)</label>
                <p>{data.sessionDurationMinutes}</p>
                <label className="form-label fw-bold">Emotional State at Start</label>
                <p>{data.emotionalStateObserved}</p>
                <label className="form-label fw-bold">Emotional State at End</label>
                <p>{data.emotionalStateEnd}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Progress Noted?</label>
                <p>{data.progressNoted ? 'Yes' : 'No'}</p>
                <label className="form-label fw-bold">Concerns Flagged?</label>
                <p>{data.concernsFlagged ? 'Yes' : 'No'}</p>
                <label className="form-label fw-bold">Referral Made?</label>
                <p>{data.referralMade ? 'Yes' : 'No'}</p>
              </div>
            </>
          )}

          {sub.formType === 'Home Visitation' && (
            <>
              <div className="col-md-6">
                <label className="form-label fw-bold">Visit Date</label>
                <p>{data.visitDate}</p>
                <label className="form-label fw-bold">Visit Type</label>
                <p>{data.visitType}</p>
                <label className="form-label fw-bold">Location Visited</label>
                <p>{data.locationVisited}</p>
                <label className="form-label fw-bold">Family Cooperation Level</label>
                <p>{data.familyCooperationLevel}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Safety Concerns Noted?</label>
                <p>{data.safetyConcernsNoted ? 'Yes' : 'No'}</p>
                <label className="form-label fw-bold">Follow-Up Needed?</label>
                <p>{data.followUpNeeded ? 'Yes' : 'No'}</p>
                <label className="form-label fw-bold">Visit Outcome</label>
                <p>{data.visitOutcome}</p>
              </div>
            </>
          )}

          {sub.formType === 'Education Record' && (
            <>
              <div className="col-md-6">
                <label className="form-label fw-bold">Record Date</label>
                <p>{data.recordDate}</p>
                <label className="form-label fw-bold">Program Name</label>
                <p>{data.programName}</p>
                <label className="form-label fw-bold">Course Name</label>
                <p>{data.courseName}</p>
                <label className="form-label fw-bold">Education Level</label>
                <p>{data.educationLevel}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Attendance Rate</label>
                <p>{(data.attendanceRate * 100).toFixed(1)}%</p>
                <label className="form-label fw-bold">Progress Percent</label>
                <p>{data.progressPercent}%</p>
                <label className="form-label fw-bold">Completion Status</label>
                <p>{data.completionStatus}</p>
                <label className="form-label fw-bold">GPA-Like Score</label>
                <p>{data.gpaLikeScore}</p>
              </div>
            </>
          )}

          {sub.formType === 'Health & Wellbeing' && (
            <>
              <div className="col-md-6">
                <label className="form-label fw-bold">Record Date</label>
                <p>{data.recordDate}</p>
                <label className="form-label fw-bold">Weight (kg)</label>
                <p>{data.weightKg}</p>
                <label className="form-label fw-bold">Height (cm)</label>
                <p>{data.heightCm}</p>
                <label className="form-label fw-bold">BMI</label>
                <p>{data.bmi}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">General Health Score</label>
                <p>{data.generalHealthScore}</p>
                <label className="form-label fw-bold">Nutrition Score</label>
                <p>{data.nutritionScore}</p>
                <label className="form-label fw-bold">Sleep Quality Score</label>
                <p>{data.sleepQualityScore}</p>
                <label className="form-label fw-bold">Energy Level Score</label>
                <p>{data.energyLevelScore}</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-3">
          <label className="form-label fw-bold">Notes</label>
          <p>{data.notes || 'None'}</p>
        </div>
      </DataCard>
    );
  }

  if (view === 'create') {
    return (
      <DataCard title="Add New Form">
        <button className="btn btn-secondary mb-3" onClick={() => setView('list')}>
          &larr; Back to List
        </button>

        {!formType ? (
          <div>
            <p className="mb-3">Select a form type to submit:</p>
            <div className="row g-2">
              <div className="col-md-6">
                <button
                  className="btn btn-outline-primary w-100 p-3"
                  onClick={() => setFormType('process-recording')}
                >
                  <strong>Process Recording</strong>
                  <br />
                  <small>Document counseling sessions</small>
                </button>
              </div>
              <div className="col-md-6">
                <button
                  className="btn btn-outline-primary w-100 p-3"
                  onClick={() => setFormType('home-visitation')}
                >
                  <strong>Home Visitation</strong>
                  <br />
                  <small>Document home or field visits</small>
                </button>
              </div>
              <div className="col-md-6">
                <button
                  className="btn btn-outline-primary w-100 p-3"
                  onClick={() => setFormType('education')}
                >
                  <strong>Education Record</strong>
                  <br />
                  <small>Track education progress</small>
                </button>
              </div>
              <div className="col-md-6">
                <button
                  className="btn btn-outline-primary w-100 p-3"
                  onClick={() => setFormType('health')}
                >
                  <strong>Health & Wellbeing</strong>
                  <br />
                  <small>Log health and wellbeing updates</small>
                </button>
              </div>
            </div>
          </div>
        ) : formType === 'process-recording' ? (
          <ProcessRecordingForm
            form={processRecordingForm}
            setForm={setProcessRecordingForm}
            residents={residents}
            onSubmit={submitProcessRecording}
            message={message}
            onCancel={() => setFormType('')}
          />
        ) : formType === 'home-visitation' ? (
          <HomeVisitationForm
            form={homeVisitationForm}
            setForm={setHomeVisitationForm}
            residents={residents}
            onSubmit={submitHomeVisitation}
            message={message}
            onCancel={() => setFormType('')}
          />
        ) : formType === 'education' ? (
          <EducationForm
            form={educationForm}
            setForm={setEducationForm}
            residents={residents}
            onSubmit={submitEducationRecord}
            message={message}
            onCancel={() => setFormType('')}
          />
        ) : (
          <HealthWellbeingForm
            form={healthForm}
            setForm={setHealthForm}
            residents={residents}
            onSubmit={submitHealthRecord}
            message={message}
            onCancel={() => setFormType('')}
          />
        )}
      </DataCard>
    );
  }
}

// Process Recording Form Component
function ProcessRecordingForm({ form, setForm, residents, onSubmit, message, onCancel }: any) {
  return (
    <div>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Resident *</label>
          <select
            className="form-control"
            value={form.residentId}
            onChange={(e) => setForm({ ...form, residentId: parseInt(e.target.value) })}
          >
            <option value="">Select a resident...</option>
            {residents.map((r: any) => (
              <option key={r.residentId} value={r.residentId}>
                {r.internalCode}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Session Date *</label>
          <input
            type="date"
            className="form-control"
            value={form.sessionDate}
            onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Session Type *</label>
          <select
            className="form-control"
            value={form.sessionType}
            onChange={(e) => setForm({ ...form, sessionType: e.target.value })}
          >
            <option value="">Select type...</option>
            <option value="Individual">Individual</option>
            <option value="Group">Group</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Duration (minutes) *</label>
          <input
            type="number"
            className="form-control"
            value={form.sessionDurationMinutes}
            onChange={(e) => setForm({ ...form, sessionDurationMinutes: parseInt(e.target.value) })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Emotional State at Start *</label>
          <select
            className="form-control"
            value={form.emotionalStateObserved}
            onChange={(e) => setForm({ ...form, emotionalStateObserved: e.target.value })}
          >
            <option value="">Select state...</option>
            <option value="Calm">Calm</option>
            <option value="Anxious">Anxious</option>
            <option value="Sad">Sad</option>
            <option value="Angry">Angry</option>
            <option value="Hopeful">Hopeful</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="Happy">Happy</option>
            <option value="Distressed">Distressed</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Emotional State at End *</label>
          <select
            className="form-control"
            value={form.emotionalStateEnd}
            onChange={(e) => setForm({ ...form, emotionalStateEnd: e.target.value })}
          >
            <option value="">Select state...</option>
            <option value="Calm">Calm</option>
            <option value="Anxious">Anxious</option>
            <option value="Sad">Sad</option>
            <option value="Angry">Angry</option>
            <option value="Hopeful">Hopeful</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="Happy">Happy</option>
            <option value="Distressed">Distressed</option>
          </select>
        </div>

        <div className="col-12">
          <label className="form-label">Session Narrative *</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.sessionNarrative}
            onChange={(e) => setForm({ ...form, sessionNarrative: e.target.value })}
          ></textarea>
        </div>

        <div className="col-12">
          <label className="form-label">Interventions Applied *</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.interventionsApplied}
            onChange={(e) => setForm({ ...form, interventionsApplied: e.target.value })}
          ></textarea>
        </div>

        <div className="col-12">
          <label className="form-label">Follow-Up Actions *</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.followUpActions}
            onChange={(e) => setForm({ ...form, followUpActions: e.target.value })}
          ></textarea>
        </div>

        <div className="col-md-4">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="progressNoted"
              checked={form.progressNoted}
              onChange={(e) => setForm({ ...form, progressNoted: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="progressNoted">
              Progress Noted?
            </label>
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="concernsFlagged"
              checked={form.concernsFlagged}
              onChange={(e) => setForm({ ...form, concernsFlagged: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="concernsFlagged">
              Concerns Flagged?
            </label>
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="referralMade"
              checked={form.referralMade}
              onChange={(e) => setForm({ ...form, referralMade: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="referralMade">
              Referral Made?
            </label>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <button className="btn btn-primary" onClick={onSubmit}>
          Submit
        </button>
        <button className="btn btn-secondary ms-2" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {message && <p className="mt-2 alert alert-info">{message}</p>}
    </div>
  );
}

// Home Visitation Form Component
function HomeVisitationForm({ form, setForm, residents, onSubmit, message, onCancel }: any) {
  return (
    <div>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Resident *</label>
          <select
            className="form-control"
            value={form.residentId}
            onChange={(e) => setForm({ ...form, residentId: parseInt(e.target.value) })}
          >
            <option value="">Select a resident...</option>
            {residents.map((r: any) => (
              <option key={r.residentId} value={r.residentId}>
                {r.internalCode}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Visit Date *</label>
          <input
            type="date"
            className="form-control"
            value={form.visitDate}
            onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Visit Type *</label>
          <select
            className="form-control"
            value={form.visitType}
            onChange={(e) => setForm({ ...form, visitType: e.target.value })}
          >
            <option value="">Select type...</option>
            <option value="Initial Assessment">Initial Assessment</option>
            <option value="Routine Follow-Up">Routine Follow-Up</option>
            <option value="Reintegration Assessment">Reintegration Assessment</option>
            <option value="Post-Placement Monitoring">Post-Placement Monitoring</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Location Visited *</label>
          <input
            type="text"
            className="form-control"
            value={form.locationVisited}
            onChange={(e) => setForm({ ...form, locationVisited: e.target.value })}
          />
        </div>

        <div className="col-12">
          <label className="form-label">Family Members Present *</label>
          <input
            type="text"
            className="form-control"
            value={form.familyMembersPresent}
            onChange={(e) => setForm({ ...form, familyMembersPresent: e.target.value })}
          />
        </div>

        <div className="col-12">
          <label className="form-label">Purpose of Visit *</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          ></textarea>
        </div>

        <div className="col-12">
          <label className="form-label">Observations *</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
          ></textarea>
        </div>

        <div className="col-md-6">
          <label className="form-label">Family Cooperation Level *</label>
          <select
            className="form-control"
            value={form.familyCooperationLevel}
            onChange={(e) => setForm({ ...form, familyCooperationLevel: e.target.value })}
          >
            <option value="">Select level...</option>
            <option value="Highly Cooperative">Highly Cooperative</option>
            <option value="Cooperative">Cooperative</option>
            <option value="Neutral">Neutral</option>
            <option value="Uncooperative">Uncooperative</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Visit Outcome *</label>
          <select
            className="form-control"
            value={form.visitOutcome}
            onChange={(e) => setForm({ ...form, visitOutcome: e.target.value })}
          >
            <option value="">Select outcome...</option>
            <option value="Favorable">Favorable</option>
            <option value="Needs Improvement">Needs Improvement</option>
            <option value="Unfavorable">Unfavorable</option>
            <option value="Inconclusive">Inconclusive</option>
          </select>
        </div>

        <div className="col-md-6">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="safetyConcernsNoted"
              checked={form.safetyConcernsNoted}
              onChange={(e) => setForm({ ...form, safetyConcernsNoted: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="safetyConcernsNoted">
              Safety Concerns Noted?
            </label>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="followUpNeeded"
              checked={form.followUpNeeded}
              onChange={(e) => setForm({ ...form, followUpNeeded: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="followUpNeeded">
              Follow-Up Needed?
            </label>
          </div>
        </div>

        {form.followUpNeeded && (
          <div className="col-12">
            <label className="form-label">Follow-Up Notes *</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.followUpNotes}
              onChange={(e) => setForm({ ...form, followUpNotes: e.target.value })}
            ></textarea>
          </div>
        )}
      </div>

      <div className="mt-3">
        <button className="btn btn-primary" onClick={onSubmit}>
          Submit
        </button>
        <button className="btn btn-secondary ms-2" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {message && <p className="mt-2 alert alert-info">{message}</p>}
    </div>
  );
}

// Education Form Component
function EducationForm({ form, setForm, residents, onSubmit, message, onCancel }: any) {
  return (
    <div>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Resident *</label>
          <select
            className="form-control"
            value={form.residentId}
            onChange={(e) => setForm({ ...form, residentId: parseInt(e.target.value) })}
          >
            <option value="">Select a resident...</option>
            {residents.map((r: any) => (
              <option key={r.residentId} value={r.residentId}>
                {r.internalCode}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Record Date *</label>
          <input
            type="date"
            className="form-control"
            value={form.recordDate}
            onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Program Name *</label>
          <select
            className="form-control"
            value={form.programName}
            onChange={(e) => setForm({ ...form, programName: e.target.value })}
          >
            <option value="">Select program...</option>
            <option value="Bridge Program">Bridge Program</option>
            <option value="Secondary Support">Secondary Support</option>
            <option value="Vocational Skills">Vocational Skills</option>
            <option value="Literacy Boost">Literacy Boost</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Course Name *</label>
          <select
            className="form-control"
            value={form.courseName}
            onChange={(e) => setForm({ ...form, courseName: e.target.value })}
          >
            <option value="">Select course...</option>
            <option value="Math">Math</option>
            <option value="English">English</option>
            <option value="Science">Science</option>
            <option value="Life Skills">Life Skills</option>
            <option value="Computer Basics">Computer Basics</option>
            <option value="Livelihood">Livelihood</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Education Level *</label>
          <select
            className="form-control"
            value={form.educationLevel}
            onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}
          >
            <option value="">Select level...</option>
            <option value="Primary">Primary</option>
            <option value="Secondary">Secondary</option>
            <option value="Vocational">Vocational</option>
            <option value="CollegePrep">CollegePrep</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">School Name</label>
          <input
            type="text"
            className="form-control"
            value={form.schoolName}
            onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Attendance Rate (0-1) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            className="form-control"
            value={form.attendanceRate}
            onChange={(e) => setForm({ ...form, attendanceRate: parseFloat(e.target.value) })}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Progress Percent (0-100) *</label>
          <input
            type="number"
            min="0"
            max="100"
            className="form-control"
            value={form.progressPercent}
            onChange={(e) => setForm({ ...form, progressPercent: parseFloat(e.target.value) })}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">GPA-Like Score (1-5) *</label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            className="form-control"
            value={form.gpaLikeScore}
            onChange={(e) => setForm({ ...form, gpaLikeScore: parseFloat(e.target.value) })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Enrollment Status</label>
          <input
            type="text"
            className="form-control"
            value={form.enrollmentStatus}
            onChange={(e) => setForm({ ...form, enrollmentStatus: e.target.value })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Completion Status *</label>
          <select
            className="form-control"
            value={form.completionStatus}
            onChange={(e) => setForm({ ...form, completionStatus: e.target.value })}
          >
            <option value="">Select status...</option>
            <option value="NotStarted">Not Started</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="col-12">
          <label className="form-label">Notes</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          ></textarea>
        </div>
      </div>

      <div className="mt-3">
        <button className="btn btn-primary" onClick={onSubmit}>
          Submit
        </button>
        <button className="btn btn-secondary ms-2" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {message && <p className="mt-2 alert alert-info">{message}</p>}
    </div>
  );
}

// Health & Wellbeing Form Component
function HealthWellbeingForm({ form, setForm, residents, onSubmit, message, onCancel }: any) {
  const bmi = form.heightCm > 0 ? (form.weightKg / ((form.heightCm / 100) * (form.heightCm / 100))).toFixed(1) : 0;

  return (
    <div>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Resident *</label>
          <select
            className="form-control"
            value={form.residentId}
            onChange={(e) => setForm({ ...form, residentId: parseInt(e.target.value) })}
          >
            <option value="">Select a resident...</option>
            {residents.map((r: any) => (
              <option key={r.residentId} value={r.residentId}>
                {r.internalCode}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Record Date *</label>
          <input
            type="date"
            className="form-control"
            value={form.recordDate}
            onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Weight (kg) *</label>
          <input
            type="number"
            step="0.1"
            className="form-control"
            value={form.weightKg}
            onChange={(e) => setForm({ ...form, weightKg: parseFloat(e.target.value) })}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Height (cm) *</label>
          <input
            type="number"
            step="0.1"
            className="form-control"
            value={form.heightCm}
            onChange={(e) => setForm({ ...form, heightCm: parseFloat(e.target.value) })}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">BMI (auto-calculated)</label>
          <input type="text" className="form-control" value={bmi} disabled />
        </div>

        <div className="col-md-6">
          <label className="form-label">General Health Score (1-5) *</label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            className="form-control"
            value={form.generalHealthScore}
            onChange={(e) => setForm({ ...form, generalHealthScore: parseFloat(e.target.value) })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Nutrition Score (1-5) *</label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            className="form-control"
            value={form.nutritionScore}
            onChange={(e) => setForm({ ...form, nutritionScore: parseFloat(e.target.value) })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Sleep Quality Score (1-5) *</label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            className="form-control"
            value={form.sleepQualityScore}
            onChange={(e) => setForm({ ...form, sleepQualityScore: parseFloat(e.target.value) })}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Energy Level Score (1-5) *</label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            className="form-control"
            value={form.energyLevelScore}
            onChange={(e) => setForm({ ...form, energyLevelScore: parseFloat(e.target.value) })}
          />
        </div>

        <div className="col-md-4">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="medicalCheckup"
              checked={form.medicalCheckupDone}
              onChange={(e) => setForm({ ...form, medicalCheckupDone: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="medicalCheckup">
              Medical Checkup Done?
            </label>
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="dentalCheckup"
              checked={form.dentalCheckupDone}
              onChange={(e) => setForm({ ...form, dentalCheckupDone: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="dentalCheckup">
              Dental Checkup Done?
            </label>
          </div>
        </div>

        <div className="col-md-4">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="psychCheckup"
              checked={form.psychologicalCheckupDone}
              onChange={(e) => setForm({ ...form, psychologicalCheckupDone: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="psychCheckup">
              Psychological Checkup Done?
            </label>
          </div>
        </div>

        <div className="col-12">
          <label className="form-label">Notes</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          ></textarea>
        </div>
      </div>

      <div className="mt-3">
        <button className="btn btn-primary" onClick={onSubmit}>
          Submit
        </button>
        <button className="btn btn-secondary ms-2" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {message && <p className="mt-2 alert alert-info">{message}</p>}
    </div>
  );
}
