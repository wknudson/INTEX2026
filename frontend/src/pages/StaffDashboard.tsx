import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { TabBar } from '../components/TabBar';
import { DataCard } from '../components/DataCard';
import { MetricsCard } from '../components/MetricsCard';
import { FilterSortTable } from '../components/FilterSortTable';
import { StaffFormsTab } from './StaffFormsTab';

export function StaffDashboard() {
  useAuth(); // Ensure auth context is loaded
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState<any>(null);
  const [riskRows, setRiskRows] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [taskText, setTaskText] = useState('');
  const [todos, setTodos] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  async function loadStaffData() {
    apiFetch('/api/dashboard/staff').then(setOverview).catch(() => setOverview(null));
    apiFetch<any[]>('/api/ml/recommended-sessions').then(setRiskRows).catch(() => setRiskRows([]));
    apiFetch<any>('/api/residents').then((r) => setResidents(r.data ?? [])).catch(() => setResidents([]));
    const todoData = await apiFetch<any[]>('/api/workplanner/todos');
    setTodos(todoData);
  }

  useEffect(() => { loadStaffData(); }, []);

  async function addTodo() {
    setMessage('');
    if (!taskText.trim()) return;
    try {
      await apiFetch('/api/workplanner/todos', { method: 'POST', body: JSON.stringify({ taskText, completed: false }) });
      setTaskText('');
      await loadStaffData();
    } catch (e) { setMessage((e as Error).message); }
  }

  async function toggleTodo(todoId: number, completed: boolean) {
    await apiFetch(`/api/workplanner/todos/${todoId}/complete`, { method: 'POST', body: JSON.stringify({ completed }) });
    await loadStaffData();
  }

  return (
    <div>
      <TabBar current={tab} tabs={['overview', 'todos', 'recommended', 'residents', 'forms']} onSelect={setTab} />

      {tab === 'overview' && <MetricsCard title="Your Workload" data={overview} />}

      {tab === 'todos' && (
        <DataCard title="To-Do List">
          <div className="row g-2 mb-3">
            <div className="col-md-9"><input className="form-control" placeholder="Add a task..." value={taskText} onChange={(e) => setTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTodo()} /></div>
            <div className="col-md-3"><button className="btn btn-primary w-100" onClick={addTodo}>Add</button></div>
          </div>
          {todos.length === 0 ? <p className="text-muted">No tasks yet.</p> : (
            <ul className="list-group">
              {todos.map((todo) => (
                <li key={todo.todoId} className="list-group-item d-flex justify-content-between">
                  <span>{todo.taskText}</span>
                  <button className="btn btn-sm btn-outline-success" onClick={() => toggleTodo(todo.todoId, false)}>Mark Incomplete</button>
                </li>
              ))}
            </ul>
          )}
          {message && <p className="mt-2 mb-0">{message}</p>}
        </DataCard>
      )}

      {tab === 'recommended' && (
        <DataCard title="ML-Recommended Sessions">
          {riskRows.length === 0 ? <p className="text-muted">No recommendations yet.</p> : (
            <FilterSortTable columns={['residentInternalCode', 'riskScore', 'lastSessionDate', 'daysSinceSession', 'recommendedAction']} rows={riskRows} />
          )}
        </DataCard>
      )}

      {tab === 'residents' && (
        <DataCard title="My Residents">
          <FilterSortTable columns={['residentId', 'internalCode', 'caseStatus', 'currentRiskLevel', 'lastSessionDate']} rows={residents} />
        </DataCard>
      )}

      {tab === 'forms' && <StaffFormsTab />}
    </div>
  );
}
