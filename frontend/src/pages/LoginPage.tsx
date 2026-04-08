import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { SiteNav } from '../components/SiteNav';

export function LoginPage() {
  const { user, login, validateMfa, loading, mfaRequired } = useAuth();
  const [email, setEmail] = useState('admin@havyn.org');
  const [password, setPassword] = useState('TempPass!12345');
  const [error, setError] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  if (user) return <Navigate to="/portal" replace />;

  if (mfaRequired) {
    return (
      <>
        <SiteNav />
        <main className="container py-4" style={{ maxWidth: 400 }}>
          <div className="card p-3">
            <h2 className="h4">MFA Verification</h2>
            <p className="text-muted">Enter the 6-digit code from your authenticator app.</p>
            <input className="form-control" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="123456" maxLength={6} />
            {error ? <div className="alert alert-danger mt-2 mb-0">{error}</div> : null}
            <button className="btn btn-primary mt-3" disabled={loading} onClick={async () => {
              setError('');
              try { await validateMfa(mfaCode); } catch (e) { setError((e as Error).message); }
            }}>{loading ? 'Verifying...' : 'Verify'}</button>
          </div>
        </main>
      </>
    );
  }

  async function registerDonor() {
    setRegisterMessage('');
    try {
      await apiFetch('/api/auth/register-donor', {
        method: 'POST',
        body: JSON.stringify({ displayName: newName, email: newEmail, password: newPassword, acceptPrivacyPolicy: acceptPrivacy }),
      });
      setRegisterMessage('Donor account created. You can now log in.');
      setNewName(''); setNewEmail(''); setNewPassword(''); setAcceptPrivacy(false);
    } catch (e) { setRegisterMessage((e as Error).message); }
  }

  return (
    <>
      <SiteNav />
      <main className="container py-4">
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card p-3">
              <h2 className="h4">Unified Login</h2>
              <p className="text-muted">All roles sign in on this page.</p>
              <label className="form-label">Email</label>
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label className="form-label mt-2">Password</label>
              <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error ? <div className="alert alert-danger mt-2 mb-0">{error}</div> : null}
              <button className="btn btn-primary mt-3" disabled={loading} onClick={async () => {
                setError('');
                try { await login(email, password); } catch (e) { setError((e as Error).message); }
              }}>{loading ? 'Signing in...' : 'Sign In'}</button>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card p-3">
              <h2 className="h4">Donor Sign Up</h2>
              <p className="text-muted">Before donating, create an account.</p>
              <label className="form-label">Display Name</label>
              <input className="form-control" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <label className="form-label mt-2">Email</label>
              <input className="form-control" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <label className="form-label mt-2">Password</label>
              <input className="form-control" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <small className="text-muted">Use 12+ chars, uppercase, lowercase, number, and symbol.</small>
              <div className="form-check mt-2">
                <input id="acceptPrivacyPolicy" className="form-check-input" type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} />
                <label htmlFor="acceptPrivacyPolicy" className="form-check-label">I agree to the <Link to="/privacy">Privacy Policy</Link>.</label>
              </div>
              <button className="btn btn-outline-primary mt-3" onClick={registerDonor}>Create Donor Account</button>
              {registerMessage ? <div className="alert alert-info mt-2 mb-0">{registerMessage}</div> : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
