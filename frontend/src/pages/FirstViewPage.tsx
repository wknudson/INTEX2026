import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

export function FirstViewPage() {
  const { refreshUser } = useAuth();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  async function acceptAndContinue() {
    setError('');
    setWorking(true);
    try {
      console.log('Accepting privacy...');
      await apiFetch('/api/auth/accept-privacy', { method: 'POST', body: JSON.stringify({ accepted: true }) });
      console.log('Privacy accepted. Accepting cookies...');
      
      await apiFetch('/api/auth/accept-cookies', { method: 'POST', body: JSON.stringify({ accepted: true }) });
      console.log('Cookies accepted. Refreshing user...');
      
      await refreshUser();
      console.log('User refreshed.');
    } catch (e) {
      const message = (e as Error).message;
      console.error('Error accepting policy:', message);
      setError(message || 'Failed to save preferences. Please try again.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="card p-4">
        <h1 className="h4">Welcome to Havyn</h1>
        <p className="mb-2">Before continuing, please review and accept the privacy policy and cookie preference.</p>
        <p className="mb-3">Read policy: <Link to="/privacy">Privacy Policy</Link></p>
        <button className="btn btn-primary" disabled={working} onClick={acceptAndContinue}>{working ? 'Saving...' : 'Accept and Continue'}</button>
        {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
      </div>
    </main>
  );
}
