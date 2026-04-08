export function TabBar({ tabs, current, onSelect }: { tabs: string[]; current: string; onSelect: (v: string) => void }) {
  return (
    <ul className="nav nav-tabs mb-3 app-tab-nav">
      {tabs.map((t) => <li key={t} className="nav-item"><button className={`nav-link ${current === t ? 'active' : ''}`} onClick={() => onSelect(t)} type="button">{t}</button></li>)}
    </ul>
  );
}
