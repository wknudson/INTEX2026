import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export type IntakeFormState = {
  caseControlNo: string;
  internalCode: string;
  safehouseId: string;
  sex: string;
  dateOfBirth: string;
  birthStatus: string;
  placeOfBirth: string;
  religion: string;
  caseCategory: string;
  subCatOrphaned: boolean;
  subCatTrafficked: boolean;
  subCatChildLabor: boolean;
  subCatPhysicalAbuse: boolean;
  subCatSexualAbuse: boolean;
  subCatOsaec: boolean;
  subCatCicl: boolean;
  subCatAtRisk: boolean;
  subCatStreetChild: boolean;
  subCatChildWithHiv: boolean;
  personWithDisability: boolean;
  pwdType: string;
  hasSpecialNeeds: boolean;
  specialNeedsDiagnosis: string;
  is4PsBeneficiary: boolean;
  soloParentHousehold: boolean;
  indigenousFamily: boolean;
  parentIsPwd: boolean;
  informalSettler: boolean;
  assignedSocialWorker: string;
  referralSource: string;
  referringAgency: string;
  dateColbRegistered: string;
  dateColbObtained: string;
  initialCaseAssessment: string;
  dateCaseStudyPrepared: string;
  reintegrationType: string;
  reintegrationStatus: string;
  initialRiskLevel: string;
  currentRiskLevel: string;
  dateOfAdmission: string;
  dateEnrolled: string;
  initialNotes: string;
  notesRestricted: string;
};

function defaultIntakeForm(): IntakeFormState {
  return {
    caseControlNo: '',
    internalCode: '',
    safehouseId: '',
    sex: 'F',
    dateOfBirth: '',
    birthStatus: '',
    placeOfBirth: '',
    religion: '',
    caseCategory: '',
    subCatOrphaned: false,
    subCatTrafficked: false,
    subCatChildLabor: false,
    subCatPhysicalAbuse: false,
    subCatSexualAbuse: false,
    subCatOsaec: false,
    subCatCicl: false,
    subCatAtRisk: false,
    subCatStreetChild: false,
    subCatChildWithHiv: false,
    personWithDisability: false,
    pwdType: '',
    hasSpecialNeeds: false,
    specialNeedsDiagnosis: '',
    is4PsBeneficiary: false,
    soloParentHousehold: false,
    indigenousFamily: false,
    parentIsPwd: false,
    informalSettler: false,
    assignedSocialWorker: '',
    referralSource: '',
    referringAgency: '',
    dateColbRegistered: '',
    dateColbObtained: '',
    initialCaseAssessment: '',
    dateCaseStudyPrepared: '',
    reintegrationType: 'None',
    reintegrationStatus: 'Not Started',
    initialRiskLevel: 'Medium',
    currentRiskLevel: 'Medium',
    dateOfAdmission: '',
    dateEnrolled: '',
    initialNotes: '',
    notesRestricted: '',
  };
}

type WorkerOption = { socialWorkerId: number; workerCode: string; displayName: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (residentId: number) => void;
  availableWorkers: WorkerOption[];
};

export function ResidentIntakeModal({ open, onClose, onSaved, availableWorkers }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState<IntakeFormState>(defaultIntakeForm);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [safehouses, setSafehouses] = useState<any[]>([]);

  const isExecutiveAdmin = user?.roles?.includes('ExecutiveAdmin') ?? false;

  useEffect(() => {
    if (!open) return;
    setForm(defaultIntakeForm());
    setMsg('');
  }, [open]);

  useEffect(() => {
    if (!open || !isExecutiveAdmin) return;
    apiFetch<any>('/api/safehouses?pageSize=500')
      .then((r) => setSafehouses(r.data ?? []))
      .catch(() => setSafehouses([]));
  }, [open, isExecutiveAdmin]);

  function set<K extends keyof IntakeFormState>(key: K, value: IntakeFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setMsg('');
    if (!form.caseControlNo.trim() || !form.internalCode.trim()) {
      setMsg('Case control number and internal code are required.');
      return;
    }
    if (isExecutiveAdmin) {
      const sid = Number(form.safehouseId);
      if (!sid || sid <= 0) {
        setMsg('Select a safehouse.');
        return;
      }
    }

    const d = (s: string) => (s.trim() ? s : null);
    const payload: Record<string, unknown> = {
      caseControlNo: form.caseControlNo.trim(),
      internalCode: form.internalCode.trim(),
      sex: form.sex || 'F',
      dateOfBirth: d(form.dateOfBirth),
      birthStatus: d(form.birthStatus),
      placeOfBirth: d(form.placeOfBirth),
      religion: d(form.religion),
      caseCategory: form.caseCategory.trim(),
      subCatOrphaned: form.subCatOrphaned,
      subCatTrafficked: form.subCatTrafficked,
      subCatChildLabor: form.subCatChildLabor,
      subCatPhysicalAbuse: form.subCatPhysicalAbuse,
      subCatSexualAbuse: form.subCatSexualAbuse,
      subCatOsaec: form.subCatOsaec,
      subCatCicl: form.subCatCicl,
      subCatAtRisk: form.subCatAtRisk,
      subCatStreetChild: form.subCatStreetChild,
      subCatChildWithHiv: form.subCatChildWithHiv,
      personWithDisability: form.personWithDisability,
      pwdType: d(form.pwdType),
      hasSpecialNeeds: form.hasSpecialNeeds,
      specialNeedsDiagnosis: d(form.specialNeedsDiagnosis),
      is4PsBeneficiary: form.is4PsBeneficiary,
      soloParentHousehold: form.soloParentHousehold,
      indigenousFamily: form.indigenousFamily,
      parentIsPwd: form.parentIsPwd,
      informalSettler: form.informalSettler,
      assignedSocialWorker: form.assignedSocialWorker.trim(),
      referralSource: d(form.referralSource),
      referringAgency: d(form.referringAgency),
      dateColbRegistered: d(form.dateColbRegistered),
      dateColbObtained: d(form.dateColbObtained),
      initialCaseAssessment: d(form.initialCaseAssessment),
      dateCaseStudyPrepared: d(form.dateCaseStudyPrepared),
      reintegrationType: form.reintegrationType,
      reintegrationStatus: form.reintegrationStatus,
      initialRiskLevel: form.initialRiskLevel,
      currentRiskLevel: form.currentRiskLevel,
      dateOfAdmission: d(form.dateOfAdmission),
      dateEnrolled: d(form.dateEnrolled),
      initialNotes: d(form.initialNotes),
      notesRestricted: d(form.notesRestricted),
    };
    if (isExecutiveAdmin) {
      payload.safehouseId = Number(form.safehouseId);
    }

    setSaving(true);
    try {
      const res = await apiFetch<any>('/api/residents', { method: 'POST', body: JSON.stringify(payload) });
      const id = res.residentId ?? res.ResidentId;
      onSaved(typeof id === 'number' ? id : Number(id));
      onClose();
    } catch (e) {
      setMsg((e as Error).message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="event-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="intake-modal-title">
      <div className="event-modal-card event-modal-card--intake">
        <h5 id="intake-modal-title" className="mb-3">
          New resident intake
        </h5>
        {!isExecutiveAdmin && user?.safehouseId != null && (
          <p className="text-muted small mb-3">Safehouse ID: {user.safehouseId} (applied automatically)</p>
        )}

        {isExecutiveAdmin && (
          <div className="mb-3">
            <label className="form-label">Safehouse *</label>
            <select
              className="form-select"
              value={form.safehouseId}
              onChange={(e) => set('safehouseId', e.target.value)}
            >
              <option value="">Select safehouse</option>
              {safehouses.map((s) => (
                <option key={s.safehouseId} value={String(s.safehouseId)}>
                  {s.name ?? s.Name} (ID {s.safehouseId ?? s.SafehouseId})
                </option>
              ))}
            </select>
          </div>
        )}

        <h6 className="text-secondary border-bottom pb-1">Case identification</h6>
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <label className="form-label">Case control number *</label>
            <input className="form-control" value={form.caseControlNo} onChange={(e) => set('caseControlNo', e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Internal code *</label>
            <input className="form-control" value={form.internalCode} onChange={(e) => set('internalCode', e.target.value)} />
          </div>
        </div>

        <h6 className="text-secondary border-bottom pb-1">Demographics</h6>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label">Sex</label>
            <select className="form-select" value={form.sex} onChange={(e) => set('sex', e.target.value)}>
              <option value="F">F</option>
              <option value="M">M</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Date of birth</label>
            <input className="form-control" type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Birth status</label>
            <input className="form-control" value={form.birthStatus} onChange={(e) => set('birthStatus', e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Place of birth</label>
            <input className="form-control" value={form.placeOfBirth} onChange={(e) => set('placeOfBirth', e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Religion</label>
            <input className="form-control" value={form.religion} onChange={(e) => set('religion', e.target.value)} />
          </div>
        </div>

        <h6 className="text-secondary border-bottom pb-1">Case type &amp; subcategories</h6>
        <div className="mb-2">
          <label className="form-label">Case category</label>
          <input className="form-control" value={form.caseCategory} onChange={(e) => set('caseCategory', e.target.value)} />
        </div>
        <div className="row g-2 mb-3 small">
          {(
            [
              ['subCatOrphaned', 'Orphaned'],
              ['subCatTrafficked', 'Trafficked'],
              ['subCatChildLabor', 'Child Labor'],
              ['subCatPhysicalAbuse', 'Physical Abuse'],
              ['subCatSexualAbuse', 'Sexual Abuse'],
              ['subCatOsaec', 'OSAEC/CSAEM'],
              ['subCatCicl', 'CICL'],
              ['subCatAtRisk', 'At Risk (CAR)'],
              ['subCatStreetChild', 'Street Child'],
              ['subCatChildWithHiv', 'Child with HIV'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="col-md-4">
              <div className="form-check">
                <input
                  id={key}
                  className="form-check-input"
                  type="checkbox"
                  checked={form[key] as boolean}
                  onChange={(e) => set(key, e.target.checked)}
                />
                <label className="form-check-label" htmlFor={key}>
                  {label}
                </label>
              </div>
            </div>
          ))}
        </div>

        <h6 className="text-secondary border-bottom pb-1">Disability &amp; special needs</h6>
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <div className="form-check">
              <input
                id="pwd"
                className="form-check-input"
                type="checkbox"
                checked={form.personWithDisability}
                onChange={(e) => set('personWithDisability', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="pwd">
                Person with disability
              </label>
            </div>
            <input
              className="form-control mt-1"
              placeholder="PWD type"
              value={form.pwdType}
              onChange={(e) => set('pwdType', e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <div className="form-check">
              <input
                id="sn"
                className="form-check-input"
                type="checkbox"
                checked={form.hasSpecialNeeds}
                onChange={(e) => set('hasSpecialNeeds', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="sn">
                Has special needs
              </label>
            </div>
            <input
              className="form-control mt-1"
              placeholder="Diagnosis / notes"
              value={form.specialNeedsDiagnosis}
              onChange={(e) => set('specialNeedsDiagnosis', e.target.value)}
            />
          </div>
        </div>

        <h6 className="text-secondary border-bottom pb-1">Family / household</h6>
        <div className="row g-2 mb-3 small">
          {(
            [
              ['is4PsBeneficiary', '4Ps beneficiary'],
              ['soloParentHousehold', 'Solo parent household'],
              ['indigenousFamily', 'Indigenous family'],
              ['parentIsPwd', 'Parent is PWD'],
              ['informalSettler', 'Informal settler'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="col-md-4">
              <div className="form-check">
                <input
                  id={key}
                  className="form-check-input"
                  type="checkbox"
                  checked={form[key] as boolean}
                  onChange={(e) => set(key, e.target.checked)}
                />
                <label className="form-check-label" htmlFor={key}>
                  {label}
                </label>
              </div>
            </div>
          ))}
        </div>

        <h6 className="text-secondary border-bottom pb-1">Assignment &amp; referral</h6>
        <div className="row g-2 mb-3">
          <div className="col-md-12">
            <label className="form-label">Assigned social worker</label>
            <select
              className="form-select"
              value={form.assignedSocialWorker}
              onChange={(e) => set('assignedSocialWorker', e.target.value)}
            >
              <option value="">— None —</option>
              {availableWorkers.map((w) => (
                <option key={w.socialWorkerId} value={w.workerCode}>
                  {w.workerCode} — {w.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Referral source</label>
            <input className="form-control" value={form.referralSource} onChange={(e) => set('referralSource', e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Referring agency / person</label>
            <input className="form-control" value={form.referringAgency} onChange={(e) => set('referringAgency', e.target.value)} />
          </div>
        </div>

        <h6 className="text-secondary border-bottom pb-1">COLB &amp; documentation</h6>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label">Date COLB registered</label>
            <input className="form-control" type="date" value={form.dateColbRegistered} onChange={(e) => set('dateColbRegistered', e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Date COLB obtained</label>
            <input className="form-control" type="date" value={form.dateColbObtained} onChange={(e) => set('dateColbObtained', e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Date case study prepared</label>
            <input className="form-control" type="date" value={form.dateCaseStudyPrepared} onChange={(e) => set('dateCaseStudyPrepared', e.target.value)} />
          </div>
          <div className="col-12">
            <label className="form-label">Initial case assessment</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.initialCaseAssessment}
              onChange={(e) => set('initialCaseAssessment', e.target.value)}
            />
          </div>
        </div>

        <h6 className="text-secondary border-bottom pb-1">Reintegration &amp; risk</h6>
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <label className="form-label">Reintegration type</label>
            <select className="form-select" value={form.reintegrationType} onChange={(e) => set('reintegrationType', e.target.value)}>
              <option>None</option>
              <option>Family Reunification</option>
              <option>Foster Care</option>
              <option>Adoption (Domestic)</option>
              <option>Adoption (Inter-Country)</option>
              <option>Independent Living</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Reintegration status</label>
            <select className="form-select" value={form.reintegrationStatus} onChange={(e) => set('reintegrationStatus', e.target.value)}>
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>On Hold</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Initial risk level</label>
            <select className="form-select" value={form.initialRiskLevel} onChange={(e) => set('initialRiskLevel', e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Current risk level</label>
            <select className="form-select" value={form.currentRiskLevel} onChange={(e) => set('currentRiskLevel', e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <h6 className="text-secondary border-bottom pb-1">Program dates</h6>
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <label className="form-label">Date of admission</label>
            <input className="form-control" type="date" value={form.dateOfAdmission} onChange={(e) => set('dateOfAdmission', e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Date enrolled</label>
            <input className="form-control" type="date" value={form.dateEnrolled} onChange={(e) => set('dateEnrolled', e.target.value)} />
          </div>
        </div>

        <h6 className="text-secondary border-bottom pb-1">Notes</h6>
        <div className="mb-3">
          <label className="form-label">Initial notes</label>
          <textarea className="form-control" rows={2} value={form.initialNotes} onChange={(e) => set('initialNotes', e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Restricted notes</label>
          <textarea className="form-control" rows={2} value={form.notesRestricted} onChange={(e) => set('notesRestricted', e.target.value)} />
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void submit()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {msg && <p className="text-danger mt-2 mb-0 small">{msg}</p>}
      </div>
    </div>
  );
}
