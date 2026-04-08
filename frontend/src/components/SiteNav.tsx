import { Link, NavLink } from 'react-router-dom';

export function SiteNav() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-bold" to="/">Havyn</Link>
      <div className="navbar-nav">
        <NavLink className="nav-link" to="/impact">Donor Impact</NavLink>
        <NavLink className="nav-link" to="/login">Login</NavLink>
        <NavLink className="nav-link" to="/privacy">Privacy Policy</NavLink>
      </div>
    </nav>
  );
}
