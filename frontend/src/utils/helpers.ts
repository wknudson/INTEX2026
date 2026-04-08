/* ─── Helpers ─── */
export function flattenTimeline(timeline: any) {
  const rows: any[] = [];
  (timeline?.processRecordings ?? []).forEach((x: any) => rows.push({ recordType: 'Process Recording', date: x.sessionDate, submittedBy: x.socialWorker, _raw: x }));
  (timeline?.homeVisitations ?? []).forEach((x: any) => rows.push({ recordType: 'Home Visitation', date: x.visitDate, submittedBy: x.socialWorker, _raw: x }));
  (timeline?.educationRecords ?? []).forEach((x: any) => rows.push({ recordType: 'Education Record', date: x.recordDate, submittedBy: 'Staff', _raw: x }));
  (timeline?.healthRecords ?? []).forEach((x: any) => rows.push({ recordType: 'Health Record', date: x.recordDate, submittedBy: 'Staff', _raw: x }));
  (timeline?.interventionPlans ?? []).forEach((x: any) => rows.push({ recordType: 'Intervention Plan', date: x.targetDate, submittedBy: 'Staff', _raw: x }));
  (timeline?.incidents ?? []).forEach((x: any) => rows.push({ recordType: 'Incident Report', date: x.incidentDate, submittedBy: x.reportedBy, _raw: x }));
  return rows;
}

export function formatDateValue(v: any) {
  return String(v ?? '') || '-';
}

export function formatTimeValue(v: any) {
  const r = String(v ?? '');
  return r ? r.slice(0, 5) : '-';
}

export function isTodayOrPast(dateValue: any) {
  const raw = String(dateValue ?? '');
  if (!raw) return false;
  const d = new Date(`${raw}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() <= today.getTime();
}

export function readCookie(name: string) {
  const match = document.cookie.split('; ').find((v) => v.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}
