import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { readCookie, writeCookie } from '../utils/helpers';

export function CookieBanner({ loggedIn = false }: { loggedIn?: boolean }) {
  const { user, refreshUser } = useAuth();
  const [closed, setClosed] = useState(false);
  const consent = readCookie('havyn_cookie_choice');
  if (closed || consent) return null;

  async function saveChoice(accepted: boolean) {
    writeCookie('havyn_cookie_choice', accepted ? 'accepted' : 'declined');
    if (loggedIn && user) {
      await apiFetch('/api/auth/accept-cookies', { method: 'POST', body: JSON.stringify({ accepted }) });
      await refreshUser();
    }
    setClosed(true);
  }

  return (
    <div className="cookie-banner shadow-sm">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div><strong>Cookie Preference</strong><p className="mb-0">We use essential cookies for login and optional cookies for preferences.</p></div>
        <button className="btn btn-sm btn-light border" onClick={() => setClosed(true)}>x</button>
      </div>
      <div className="d-flex gap-2 mt-2">
        <button className="btn btn-sm btn-outline-light" onClick={() => saveChoice(false)}>Decline</button>
        <button className="btn btn-sm btn-light" onClick={() => saveChoice(true)}>Accept</button>
      </div>
    </div>
  );
}
