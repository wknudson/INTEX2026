import { useState } from 'react';
import { DataCard } from './DataCard';
import { formatDateValue, formatTimeValue, isTodayOrPast } from '../utils/helpers';

export function ScheduleCalendar({ title, appointments, residents, onFillOutForm, onAddEvent, onEditEvent, onDeleteEvent, onToggleComplete }: {
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
