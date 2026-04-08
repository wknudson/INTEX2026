import { Fragment } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { StaffDashboard } from './StaffDashboard';
import { DonorDashboard } from './DonorDashboard';
import { FirstViewPage } from './FirstViewPage';
import { CookieBanner } from '../components/CookieBanner';

export function PortalPage() {
  const { user, logout, refreshUser } = useAuth();

  if (!user) return <Navigate to="/login" />;

  const needsPrivacy = user.roles[0] !== 'Donor' && !user.privacyPolicyAccepted;
  if (needsPrivacy) return <FirstViewPage />;

  const renderDashboard = () => {
    const role = user.roles[0];
    switch (role) {
      case 'ExecutiveAdmin': return <AdminDashboard />;
      case 'RegionalManager': return <ManagerDashboard />;
      case 'SocialWorker': return <StaffDashboard />;
      case 'Donor': return <DonorDashboard />;
      default: return <div>Dashboard not found for role: {role}</div>;
    }
  };

  return (
    <Fragment>
      <div className="d-flex justify-content-between align-items-center border-bottom p-3 mb-3">
        <h5 className="mb-0">Havyn Command Center</h5>
        <div className="text-end">
          <p className="mb-1"><small className="text-muted">{user.displayName} ({user.email})</small></p>
          <div className="d-flex gap-2 justify-content-end">
            <button className="btn btn-sm btn-outline-secondary" onClick={refreshUser}>Refresh</button>
            <button className="btn btn-sm btn-outline-danger" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
      <div className="container">
        {renderDashboard()}
      </div>
      {user.roles[0] !== 'Donor' && <CookieBanner />}
    </Fragment>
  );
}
